// EcoSphere Carbon Emissions Calculation Module
// Science-backed coefficients from US EPA & UK DEFRA

function calculateEmissions(inputs) {
    // A. Transportation Emissions (kg CO2e / year)
    let carFactor = 0.22; // Default Petrol = 0.22 kg/km
    if (inputs.carType === 'diesel') carFactor = 0.25;
    else if (inputs.carType === 'hybrid') carFactor = 0.12;
    else if (inputs.carType === 'electric') carFactor = 0.05; // grid overhead

    const carEmissions = inputs.carKm * 52 * carFactor;
    const flightEmissions = inputs.flights * 150; // 150 kg per flight hour
    const transitEmissions = inputs.transit * 52 * 0.04; // 0.04 kg per km

    const transportTotal = carEmissions + flightEmissions + transitEmissions;

    // B. Home Energy (kg CO2e / year)
    // Electricity: 0.40 kg / kWh, scaled down by clean energy percentage offset
    const gridElectricityEmissions = (inputs.electricity * 12) * 0.40 * (1 - (inputs.cleanEnergy / 100));
    const gasEmissions = inputs.heatingGas * 12 * 2.0; // Gas heating: 2.0 kg / m3
    const oilEmissions = inputs.heatingOil * 12 * 2.5; // Oil heating: 2.5 kg / liter

    const energyTotal = gridElectricityEmissions + gasEmissions + oilEmissions;

    // C. Diet (kg CO2e / year)
    let dietBase = 2500; // heavy meat
    if (inputs.diet === 'mod-meat') dietBase = 1700;
    else if (inputs.diet === 'vegetarian') dietBase = 1200;
    else if (inputs.diet === 'vegan') dietBase = 900;

    const organicDiscount = 1 - ((inputs.organic / 100) * 0.10); // up to 10% discount
    const dietTotal = dietBase * organicDiscount;

    // D. Lifestyle & Shopping (kg CO2e / year)
    const clothesEmissions = inputs.clothing * 25; // 25 kg per item
    const electronicsEmissions = inputs.electronics * 150; // 150 kg per device upgrade
    const miscEmissions = 400; // Services and general waste base
    const lifestyleBase = clothesEmissions + electronicsEmissions + miscEmissions;

    const recyclingDiscount = 1 - ((inputs.recycling / 100) * 0.25); // up to 25% discount
    const lifestyleTotal = lifestyleBase * recyclingDiscount;

    return {
        transport: transportTotal,
        energy: energyTotal,
        diet: dietTotal,
        lifestyle: lifestyleTotal,
        total: transportTotal + energyTotal + dietTotal + lifestyleTotal
    };
}

// Node.js module export support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateEmissions };
}
