// Unit Test Suite for emissionsCalculator math model
const { calculateEmissions } = require('./emissionsCalculator');

describe('Carbon Footprint Calculator Math model tests', () => {
    
    test('Calculates default user footprint correctly', () => {
        const defaults = {
            carKm: 150,
            carType: 'petrol',
            flights: 10,
            transit: 50,
            electricity: 300,
            cleanEnergy: 0,
            heatingGas: 80,
            heatingOil: 0,
            diet: 'heavy-meat',
            organic: 20,
            clothing: 20,
            electronics: 2,
            recycling: 30
        };

        const result = calculateEmissions(defaults);

        // Expected maths:
        // Car: 150 * 52 * 0.22 = 1716
        // Flights: 10 * 150 = 1500
        // Transit: 50 * 52 * 0.04 = 104
        // Transport Total = 3320 kg
        expect(result.transport).toBeCloseTo(3320, 1);

        // Electricity: (300 * 12) * 0.40 * 1 = 1440
        // Gas: 80 * 12 * 2 = 1920
        // Oil: 0
        // Energy Total = 3360 kg
        expect(result.energy).toBeCloseTo(3360, 1);

        // Diet Base: 2500 (heavy-meat)
        // Organic discount: 1 - (20/100 * 0.1) = 0.98
        // Diet Total = 2450 kg
        expect(result.diet).toBeCloseTo(2450, 1);

        // Lifestyle Base: 20 * 25 + 2 * 150 + 400 = 1200
        // Recycling discount: 1 - (30/100 * 0.25) = 0.925
        // Lifestyle Total = 1110 kg
        expect(result.lifestyle).toBeCloseTo(1110, 1);

        // Total = 3320 + 3360 + 2450 + 1110 = 10240 kg
        expect(result.total).toBeCloseTo(10240, 1);
    });

    test('Vegan diet style yields lower diet emissions', () => {
        const veganInputs = {
            carKm: 0,
            carType: 'electric',
            flights: 0,
            transit: 0,
            electricity: 0,
            cleanEnergy: 100,
            heatingGas: 0,
            heatingOil: 0,
            diet: 'vegan',
            organic: 100, // full organic/local
            clothing: 0,
            electronics: 0,
            recycling: 100
        };

        const result = calculateEmissions(veganInputs);

        // Diet Base: 900 (vegan)
        // Organic discount: 1 - (100/100 * 0.1) = 0.9
        // Diet Total = 810 kg
        expect(result.diet).toBeCloseTo(810, 1);
    });

    test('Clean energy share scales electricity emissions to zero', () => {
        const cleanHomeInputs = {
            carKm: 0,
            carType: 'electric',
            flights: 0,
            transit: 0,
            electricity: 500,
            cleanEnergy: 100, // 100% solar/wind
            heatingGas: 0,
            heatingOil: 0,
            diet: 'vegan',
            organic: 0,
            clothing: 0,
            electronics: 0,
            recycling: 0
        };

        const result = calculateEmissions(cleanHomeInputs);
        expect(result.energy).toBeCloseTo(0, 1);
    });

    test('EV car factors are computed accurately', () => {
        const evInputs = {
            carKm: 200,
            carType: 'electric',
            flights: 0,
            transit: 0,
            electricity: 0,
            cleanEnergy: 0,
            heatingGas: 0,
            heatingOil: 0,
            diet: 'vegan',
            organic: 0,
            clothing: 0,
            electronics: 0,
            recycling: 0
        };

        const result = calculateEmissions(evInputs);
        // Car: 200 * 52 * 0.05 = 520 kg
        expect(result.transport).toBeCloseTo(520, 1);
    });

    test('Zero inputs yield baseline lifestyle and diet emissions', () => {
        const zeroInputs = {
            carKm: 0,
            carType: 'petrol',
            flights: 0,
            transit: 0,
            electricity: 0,
            cleanEnergy: 0,
            heatingGas: 0,
            heatingOil: 0,
            diet: 'vegan',
            organic: 0,
            clothing: 0,
            electronics: 0,
            recycling: 0
        };

        const result = calculateEmissions(zeroInputs);
        expect(result.transport).toBe(0);
        expect(result.energy).toBe(0);
        expect(result.diet).toBe(900); // base vegan diet
        expect(result.lifestyle).toBe(400); // services base
        expect(result.total).toBe(1300);
    });

    test('Undefined or partial inputs fail safe with defaults', () => {
        const result = calculateEmissions(null);
        // Should fallback to heavy-meat (2500) + lifestyle base (400) = 2900 kg total
        expect(result.transport).toBe(0);
        expect(result.energy).toBe(0);
        expect(result.diet).toBe(2500);
        expect(result.lifestyle).toBe(400);
        expect(result.total).toBe(2900);
    });

    test('Validates organic and recycling discount boundaries', () => {
        const overLimitInputs = {
            diet: 'vegan',
            organic: 150, // above 100%
            clothing: 0,
            electronics: 0,
            recycling: 200 // above 100%
        };
        const result = calculateEmissions(overLimitInputs);
        // organic discount should be capped at 10% (organicOffset clamped at 1.0)
        expect(result.diet).toBe(810); // 900 * 0.9
        // recycling discount should be capped at 25% (recyclingOffset clamped at 1.0)
        expect(result.lifestyle).toBe(300); // 400 * 0.75
    });
});
