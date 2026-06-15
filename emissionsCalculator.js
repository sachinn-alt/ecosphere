// EcoSphere Carbon Emissions Calculation Module
// Science-backed coefficients from US EPA & UK DEFRA

function calculateEmissions(inputs) {
    // Standardize and sanitize inputs with safe defaults
    const safeInputs = inputs || {};
    const carKm = Number(safeInputs.carKm) || 0;
    const carType = String(safeInputs.carType || 'petrol').toLowerCase();
    const flights = Number(safeInputs.flights) || 0;
    const transit = Number(safeInputs.transit) || 0;
    const electricity = Number(safeInputs.electricity) || 0;
    const cleanEnergy = Number(safeInputs.cleanEnergy) || 0;
    const heatingGas = Number(safeInputs.heatingGas) || 0;
    const heatingOil = Number(safeInputs.heatingOil) || 0;
    const diet = String(safeInputs.diet || 'heavy-meat').toLowerCase();
    const organic = Number(safeInputs.organic) || 0;
    const clothing = Number(safeInputs.clothing) || 0;
    const electronics = Number(safeInputs.electronics) || 0;
    const recycling = Number(safeInputs.recycling) || 0;

    // A. Transportation Emissions (kg CO2e / year)
    let carFactor = 0.22; // Default Petrol = 0.22 kg/km
    if (carType === 'diesel') carFactor = 0.25;
    else if (carType === 'hybrid') carFactor = 0.12;
    else if (carType === 'electric') carFactor = 0.05; // grid overhead

    const carEmissions = carKm * 52 * carFactor;
    const flightEmissions = flights * 150; // 150 kg per flight hour
    const transitEmissions = transit * 52 * 0.04; // 0.04 kg per km

    const transportTotal = carEmissions + flightEmissions + transitEmissions;

    // B. Home Energy (kg CO2e / year)
    // Electricity: 0.40 kg / kWh, scaled down by clean energy percentage offset
    const cleanEnergyOffset = Math.min(100, Math.max(0, cleanEnergy)) / 100;
    const gridElectricityEmissions = (electricity * 12) * 0.40 * (1 - cleanEnergyOffset);
    const gasEmissions = heatingGas * 12 * 2.0; // Gas heating: 2.0 kg / m3
    const oilEmissions = heatingOil * 12 * 2.5; // Oil heating: 2.5 kg / liter

    const energyTotal = gridElectricityEmissions + gasEmissions + oilEmissions;

    // C. Diet (kg CO2e / year)
    let dietBase = 2500; // heavy meat
    if (diet === 'mod-meat') dietBase = 1700;
    else if (diet === 'vegetarian') dietBase = 1200;
    else if (diet === 'vegan') dietBase = 900;

    const organicOffset = Math.min(100, Math.max(0, organic)) / 100;
    const organicDiscount = 1 - (organicOffset * 0.10); // up to 10% discount
    const dietTotal = dietBase * organicDiscount;

    // D. Lifestyle & Shopping (kg CO2e / year)
    const clothesEmissions = clothing * 25; // 25 kg per item
    const electronicsEmissions = electronics * 150; // 150 kg per device upgrade
    const miscEmissions = 400; // Services and general waste base
    const lifestyleBase = clothesEmissions + electronicsEmissions + miscEmissions;

    const recyclingOffset = Math.min(100, Math.max(0, recycling)) / 100;
    const recyclingDiscount = 1 - (recyclingOffset * 0.25); // up to 25% discount
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
