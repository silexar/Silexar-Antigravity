/**
 * Silexar Pulse SDK for Android
 * 
 * Created by Silexar Pulse Team
 * Version: 2.0.0
 * 
 * IMPORTANTE: Este es un ESQUELETO/PLANTILLA.
 * Los desarrolladores Android deben completar las implementaciones marcadas con TODO.
 */

package com.silexar.pulse.sdk

import android.content.Context
import android.os.Build
import android.os.BatteryManager
import android.util.Log
import com.google.android.gms.location.ActivityRecognition
import com.google.android.gms.location.ActivityRecognitionClient
import com.google.android.gms.location.DetectedActivity
import kotlinx.coroutines.*
import java.util.*

// ============================================================================
// CONFIGURATION
// ============================================================================

data class SilexarPulseConfig(
    val apiKey: String,
    val environment: Environment = Environment.PRODUCTION,
    val debugLogging: Boolean = false
) {
    enum class Environment {
        PRODUCTION,
        STAGING,
        DEVELOPMENT
    }
}

// ============================================================================
// CONTEXT DETECTION
// ============================================================================

enum class ContextType(val value: String) {
    IN_TRANSIT("IN_TRANSIT"),
    WALKING("WALKING"),
    STATIONARY("STATIONARY"),
    AT_HOME("AT_HOME"),
    AT_WORK("AT_WORK"),
    SECOND_SCREEN("SECOND_SCREEN"),
    ACTIVE_BROWSING("ACTIVE_BROWSING"),
    EVENING_RELAXATION("EVENING_RELAXATION"),
    WAITING("WAITING"),
    COMMUTING("COMMUTING"),
    UNKNOWN("UNKNOWN")
}

data class ContextData(
    val contextType: ContextType,
    val confidence: Double,
    val timestamp: Long,
    val activityLevel: String,
    val networkType: String
)

// ============================================================================
// AD FORMATS
// ============================================================================

sealed class AdFormat {
    data class Banner(val size: BannerSize) : AdFormat()
    object Interstitial : AdFormat()
    object RewardedVideo : AdFormat()
    object Native : AdFormat()
    object Audio : AdFormat()
    object Mraid : AdFormat()
    
    enum class BannerSize {
        STANDARD,      // 320x50
        LARGE_BANNER,  // 320x100
        MEDIUM_RECT,   // 300x250
        LEADERBOARD    // 728x90
    }
}

data class AdRequest(
    val format: AdFormat,
    val campaignId: String? = null,
    val narrativeId: String? = null,
    val contextType: ContextType? = null
)

data class AdResponse(
    val adId: String,
    val format: AdFormat,
    val creativeUrl: String?,
    val clickThroughUrl: String?,
    val narrativeNodeId: String?,
    val trackingPixels: List<String>
)

// ============================================================================
// FEDERATED LEARNING
// ============================================================================

data class FLModelUpdate(
    val modelVersion: String,
    val gradients: ByteArray,
    val numSamples: Int,
    val avgLoss: Double,
    val primaryContext: ContextType
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as FLModelUpdate
        if (modelVersion != other.modelVersion) return false
        if (!gradients.contentEquals(other.gradients)) return false
        return true
    }

    override fun hashCode(): Int {
        var result = modelVersion.hashCode()
        result = 31 * result + gradients.contentHashCode()
        return result
    }
}

data class FLConfig(
    val enabled: Boolean,
    val trainOnWiFiOnly: Boolean,
    val trainWhileCharging: Boolean,
    val minBatteryLevel: Int
)

// ============================================================================
// CALLBACKS
// ============================================================================

interface SilexarPulseListener {
    fun onInitialized()
    fun onInitializationFailed(error: SilexarError)
    fun onContextChanged(context: ContextData)
    fun onAdLoaded(response: AdResponse)
    fun onAdFailed(error: SilexarError)
    fun onAdClosed(adId: String)
    fun onModelUpdateReady(version: String)
}

// ============================================================================
// ERRORS
// ============================================================================

sealed class SilexarError(message: String) : Exception(message) {
    object NotInitialized : SilexarError("SDK not initialized")
    object InvalidApiKey : SilexarError("Invalid API key")
    object NetworkError : SilexarError("Network error")
    object NoAdAvailable : SilexarError("No ad available")
    object FLDisabled : SilexarError("Federated learning is disabled")
    object FLConditionsNotMet : SilexarError("FL training conditions not met")
    class Custom(message: String) : SilexarError(message)
}

// ============================================================================
// MAIN SDK CLASS
// ============================================================================

class SilexarPulseSDK private constructor() {
    
    companion object {
        private const val TAG = "SilexarPulse"
        private const val PREFS_NAME = "silexar_pulse_prefs"
        private const val KEY_SDK_ID = "sdk_id"
        
        @Volatile
        private var instance: SilexarPulseSDK? = null
        
        fun getInstance(): SilexarPulseSDK {
            return instance ?: synchronized(this) {
                instance ?: SilexarPulseSDK().also { instance = it }
            }
        }
    }
    
    // Properties
    private var config: SilexarPulseConfig? = null
    private var sdkId: String? = null
    private var isInitialized = false
    private var applicationContext: Context? = null
    private var activityRecognitionClient: ActivityRecognitionClient? = null
    private var currentContext: ContextData? = null
    private var flConfig: FLConfig? = null
    private var listener: SilexarPulseListener? = null
    
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    /**
     * Inicializa el SDK con la configuración proporcionada
     */
    fun initialize(context: Context, config: SilexarPulseConfig, listener: SilexarPulseListener? = null) {
        this.applicationContext = context.applicationContext
        this.config = config
        this.listener = listener
        
        // Obtener o generar SDK ID
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        sdkId = prefs.getString(KEY_SDK_ID, null) ?: run {
            val newId = UUID.randomUUID().toString()
            prefs.edit().putString(KEY_SDK_ID, newId).apply()
            newId
        }
        
        // Iniciar configuración desde servidor
        scope.launch {
            try {
                // TODO: Llamar al endpoint /api/v2/sdk/config
                fetchConfiguration()
                
                withContext(Dispatchers.Main) {
                    isInitialized = true
                    startContextDetection()
                    listener?.onInitialized()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    listener?.onInitializationFailed(SilexarError.Custom(e.message ?: "Unknown error"))
                }
            }
        }
    }
    
    // ========================================================================
    // CONTEXT DETECTION
    // ========================================================================
    
    /**
     * Inicia la detección de contexto usando Activity Recognition API
     */
    private fun startContextDetection() {
        val context = applicationContext ?: return
        
        // TODO: Solicitar permisos de Activity Recognition
        // Implementar PendingIntent para recibir actualizaciones
        
        try {
            activityRecognitionClient = ActivityRecognition.getClient(context)
            
            // TODO: Implementar detección real usando:
            // activityRecognitionClient?.requestActivityUpdates(...)
            
            log("Context detection started")
        } catch (e: Exception) {
            log("Failed to start context detection: ${e.message}")
        }
    }
    
    /**
     * Procesa una actividad detectada
     */
    fun handleActivityResult(detectedActivities: List<DetectedActivity>) {
        val mostProbable = detectedActivities.maxByOrNull { it.confidence } ?: return
        
        val contextType = when (mostProbable.type) {
            DetectedActivity.IN_VEHICLE -> ContextType.IN_TRANSIT
            DetectedActivity.ON_BICYCLE -> ContextType.COMMUTING
            DetectedActivity.WALKING -> ContextType.WALKING
            DetectedActivity.RUNNING -> ContextType.WALKING
            DetectedActivity.STILL -> ContextType.STATIONARY
            else -> ContextType.UNKNOWN
        }
        
        val contextData = ContextData(
            contextType = contextType,
            confidence = mostProbable.confidence / 100.0,
            timestamp = System.currentTimeMillis(),
            activityLevel = if (mostProbable.type == DetectedActivity.STILL) "low" else "medium",
            networkType = getNetworkType()
        )
        
        currentContext = contextData
        listener?.onContextChanged(contextData)
    }
    
    /**
     * Obtiene el contexto actual detectado
     */
    fun getCurrentContext(): ContextData? = currentContext
    
    // ========================================================================
    // AD MANAGEMENT
    // ========================================================================
    
    /**
     * Solicita un anuncio con el formato especificado
     */
    fun requestAd(request: AdRequest, callback: (Result<AdResponse>) -> Unit) {
        if (!isInitialized) {
            callback(Result.failure(SilexarError.NotInitialized))
            return
        }
        
        scope.launch {
            try {
                // TODO: Implementar llamada a /api/v2/ads/request
                // Incluir contexto actual en la solicitud
                
                log("Requesting ad: ${request.format}")
                
                // Placeholder response
                val response = AdResponse(
                    adId = UUID.randomUUID().toString(),
                    format = request.format,
                    creativeUrl = null,
                    clickThroughUrl = null,
                    narrativeNodeId = null,
                    trackingPixels = emptyList()
                )
                
                withContext(Dispatchers.Main) {
                    callback(Result.success(response))
                    listener?.onAdLoaded(response)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    callback(Result.failure(SilexarError.Custom(e.message ?: "Unknown error")))
                }
            }
        }
    }
    
    /**
     * Muestra un anuncio interstitial o rewarded
     */
    fun showAd(adId: String, activity: android.app.Activity, callback: (Result<Unit>) -> Unit) {
        if (!isInitialized) {
            callback(Result.failure(SilexarError.NotInitialized))
            return
        }
        
        // TODO: Implementar presentación de anuncio
        // Crear Activity o Dialog para mostrar el anuncio
        
        log("Showing ad: $adId")
        
        // Registrar impresión
        trackInteraction(InteractionType.IMPRESSION, adId, null)
        
        callback(Result.success(Unit))
    }
    
    // ========================================================================
    // EVENT TRACKING
    // ========================================================================
    
    enum class InteractionType(val value: String) {
        IMPRESSION("impression"),
        CLICK("click"),
        COMPLETE("complete"),
        SKIP("skip"),
        FIRST_QUARTILE("first_quartile"),
        MIDPOINT("midpoint"),
        THIRD_QUARTILE("third_quartile"),
        CPVI("cpvi")
    }
    
    /**
     * Registra una interacción con un anuncio
     */
    fun trackInteraction(type: InteractionType, adId: String, data: Map<String, Any>?) {
        if (!isInitialized) return
        
        scope.launch {
            // TODO: Implementar llamada a /api/v2/events/track
            
            log("Tracking interaction: ${type.value} for ad: $adId")
        }
    }
    
    // ========================================================================
    // FEDERATED LEARNING
    // ========================================================================
    
    /**
     * Envía actualización de modelo federado al servidor
     */
    fun sendFLUpdate(update: FLModelUpdate, callback: (Result<String>) -> Unit) {
        if (!isInitialized) {
            callback(Result.failure(SilexarError.NotInitialized))
            return
        }
        
        val fl = flConfig
        if (fl == null || !fl.enabled) {
            callback(Result.failure(SilexarError.FLDisabled))
            return
        }
        
        // Verificar condiciones de entrenamiento
        if (fl.trainOnWiFiOnly && !isOnWiFi()) {
            callback(Result.failure(SilexarError.FLConditionsNotMet))
            return
        }
        
        if (fl.trainWhileCharging && !isCharging()) {
            callback(Result.failure(SilexarError.FLConditionsNotMet))
            return
        }
        
        scope.launch {
            try {
                // TODO: Implementar llamada a /api/v2/events/fl-update
                
                log("Sending FL update for model version: ${update.modelVersion}")
                
                withContext(Dispatchers.Main) {
                    callback(Result.success("update_sent"))
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    callback(Result.failure(SilexarError.Custom(e.message ?: "Unknown error")))
                }
            }
        }
    }
    
    // ========================================================================
    // PRIVACY & CONSENT
    // ========================================================================
    
    /**
     * Establece el consentimiento del usuario
     */
    fun setConsent(gdprConsent: Boolean, personalizedAds: Boolean, analytics: Boolean) {
        val context = applicationContext ?: return
        
        // TODO: Guardar preferencias de consentimiento
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putBoolean("consent_gdpr", gdprConsent)
            .putBoolean("consent_personalized", personalizedAds)
            .putBoolean("consent_analytics", analytics)
            .apply()
        
        log("Consent updated: GDPR=$gdprConsent, PersonalizedAds=$personalizedAds, Analytics=$analytics")
    }
    
    /**
     * Elimina todos los datos del usuario
     */
    fun clearUserData(callback: (Result<Unit>) -> Unit) {
        val context = applicationContext ?: run {
            callback(Result.failure(SilexarError.NotInitialized))
            return
        }
        
        scope.launch {
            try {
                // Limpiar datos locales
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .clear()
                    .apply()
                
                // TODO: Llamar al servidor para eliminar datos del usuario
                
                sdkId = null
                
                withContext(Dispatchers.Main) {
                    log("User data cleared")
                    callback(Result.success(Unit))
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    callback(Result.failure(SilexarError.Custom(e.message ?: "Unknown error")))
                }
            }
        }
    }
    
    // ========================================================================
    // PRIVATE HELPERS
    // ========================================================================
    
    private suspend fun fetchConfiguration() {
        // TODO: Implementar llamada HTTP real a /api/v2/sdk/config
        
        // Placeholder config
        flConfig = FLConfig(
            enabled = true,
            trainOnWiFiOnly = true,
            trainWhileCharging = true,
            minBatteryLevel = 20
        )
    }
    
    private fun getNetworkType(): String {
        // TODO: Implementar detección de tipo de red
        return "wifi"
    }
    
    private fun isOnWiFi(): Boolean {
        // TODO: Implementar verificación de WiFi usando ConnectivityManager
        return true
    }
    
    private fun isCharging(): Boolean {
        val context = applicationContext ?: return false
        val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            batteryManager?.isCharging == true
        } else {
            // Fallback para versiones anteriores
            true
        }
    }
    
    private fun log(message: String) {
        if (config?.debugLogging == true) {
            Log.d(TAG, message)
        }
    }
    
    /**
     * Limpia recursos cuando el SDK ya no se necesita
     */
    fun destroy() {
        scope.cancel()
        activityRecognitionClient = null
        isInitialized = false
    }
}

// ============================================================================
// BANNER VIEW (Jetpack Compose)
// ============================================================================

/*
// Descomentar cuando se use Jetpack Compose
@Composable
fun SilexarBannerView(
    size: AdFormat.BannerSize = AdFormat.BannerSize.STANDARD,
    campaignId: String? = null,
    modifier: Modifier = Modifier
) {
    val sdk = SilexarPulseSDK.getInstance()
    var adResponse by remember { mutableStateOf<AdResponse?>(null) }
    
    LaunchedEffect(Unit) {
        sdk.requestAd(
            AdRequest(
                format = AdFormat.Banner(size),
                campaignId = campaignId
            )
        ) { result ->
            result.onSuccess { adResponse = it }
        }
    }
    
    Box(modifier = modifier) {
        // TODO: Renderizar contenido del anuncio
        if (adResponse != null) {
            // Mostrar anuncio
        }
    }
}
*/
