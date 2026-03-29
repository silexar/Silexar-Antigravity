export const seedCampanas = async () => {
    const campanas = [
        { id: 'camp_1', nombre: 'Campaña Test 1', estado: 'ACTIVA' },
        { id: 'camp_2', nombre: 'Campaña Test 2', estado: 'PAUSADA' },
    ];
    console.log('Seeded campanas:', campanas);
    return campanas;
};
export default seedCampanas;
