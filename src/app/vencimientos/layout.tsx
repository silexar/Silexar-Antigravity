/**
 * SILEXAR PULSE - Vencimientos Layout TIER 0
 *
 * @description Layout principal del modulo de vencimientos.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export default function VencimientosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto max-w-7xl py-6">
            {children}
        </div>
    );
}
