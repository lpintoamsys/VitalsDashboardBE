import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const staticUsers = [
    {
        firstName: "Alice",
        lastName: "Smith",
        sex: "Female",
        age: 24,
        email: "alicesmith@pulsecare.com",
        ssn: "19242427"
    },
];

// Heart rate ranges by age group and sex
const heartRateRanges = {
    Male: {
        "18-25": {
            Athlete: [49, 55],
            Excellent: [56, 61],
            Good: [62, 65],
            "Above Average": [66, 69],
            Average: [70, 73],
            "Below Average": [74, 81],
            Poor: [82, 100]
        },
        "26-35": {
            Athlete: [49, 54],
            Excellent: [55, 61],
            Good: [62, 65],
            "Above Average": [66, 70],
            Average: [71, 74],
            "Below Average": [75, 81],
            Poor: [82, 100]
        },
        "36-45": {
            Athlete: [50, 56],
            Excellent: [57, 62],
            Good: [63, 66],
            "Above Average": [67, 70],
            Average: [71, 75],
            "Below Average": [76, 82],
            Poor: [83, 100]
        },
        "46-55": {
            Athlete: [50, 57],
            Excellent: [58, 63],
            Good: [64, 67],
            "Above Average": [68, 71],
            Average: [72, 76],
            "Below Average": [77, 83],
            Poor: [84, 100]
        },
        "56-65": {
            Athlete: [51, 56],
            Excellent: [57, 61],
            Good: [62, 67],
            "Above Average": [68, 71],
            Average: [72, 75],
            "Below Average": [76, 81],
            Poor: [82, 100]
        },
        "65+": {
            Athlete: [50, 55],
            Excellent: [56, 61],
            Good: [62, 65],
            "Above Average": [66, 69],
            Average: [70, 73],
            "Below Average": [74, 79],
            Poor: [80, 100]
        }
    },
    Female: {
        "18-25": {
            Athlete: [54, 60],
            Excellent: [61, 65],
            Good: [66, 69],
            "Above Average": [70, 73],
            Average: [74, 78],
            "Below Average": [79, 84],
            Poor: [85, 100]
        },
        "26-35": {
            Athlete: [54, 59],
            Excellent: [60, 64],
            Good: [65, 68],
            "Above Average": [69, 72],
            Average: [73, 76],
            "Below Average": [77, 82],
            Poor: [83, 100]
        },
        "36-45": {
            Athlete: [54, 59],
            Excellent: [60, 64],
            Good: [65, 69],
            "Above Average": [70, 73],
            Average: [74, 78],
            "Below Average": [79, 84],
            Poor: [85, 100]
        },
        "46-55": {
            Athlete: [54, 60],
            Excellent: [61, 65],
            Good: [66, 69],
            "Above Average": [70, 73],
            Average: [74, 77],
            "Below Average": [78, 83],
            Poor: [84, 100]
        },
        "56-65": {
            Athlete: [54, 59],
            Excellent: [60, 64],
            Good: [65, 68],
            "Above Average": [69, 73],
            Average: [74, 77],
            "Below Average": [78, 83],
            Poor: [84, 100]
        },
        "65+": {
            Athlete: [54, 59],
            Excellent: [60, 64],
            Good: [65, 68],
            "Above Average": [69, 72],
            Average: [73, 76],
            "Below Average": [77, 84],
            Poor: [84, 100]
        }
    }
};

// Initialize OpenAI client with proper API key validation
let openai;
try {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('OpenAI client initialized successfully');
} catch (error) {
    console.error('Failed to initialize OpenAI client:', error.message);
    // We'll continue execution but the OpenAI functions will use fallback responses
}


/**
 * Determines the appropriate age group category for a given age
 * Used for looking up heart rate ranges in the heartRateRanges object
 * @param {number} age - The age of the person
 * @returns {string} - The age group category (e.g., "18-25", "26-35", etc.)
 */
const getAgeGroup = (age) => {
    if (age <= 25) return "18-25";
    if (age <= 35) return "26-35";
    if (age <= 45) return "36-45";
    if (age <= 55) return "46-55";
    if (age <= 65) return "56-65";
    return "65+";
};

/**
 * Generates a random integer within the specified range (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} - A random integer between min and max (inclusive)
 */
const getRandomInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generates a random fitness level and corresponding heart rate based on sex and age
 * Uses the heartRateRanges lookup table to determine appropriate ranges
 * @param {string} sex - The person's sex ("Male" or "Female")
 * @param {number} age - The person's age
 * @returns {Object} - Object containing heartRate and fitnessLevel
 */
const getHeartRateAndFitness = (sex, age) => {
    const ageGroup = getAgeGroup(age);
    const ranges = heartRateRanges[sex][ageGroup];
    const fitnessLevels = Object.keys(ranges);
    const randomFitnessLevel = fitnessLevels[Math.floor(Math.random() * fitnessLevels.length)];
    const [min, max] = ranges[randomFitnessLevel];

    return {
        heartRate: getRandomInRange(min, max),
        fitnessLevel: randomFitnessLevel
    };
};


/**
 * Generates personalized health recommendations using OpenAI's API
 * If OpenAI API fails, falls back to a predefined template
 * @param {Object} vitals - Object containing user's health data
 * @returns {string} - Formatted health recommendations
 */
const generateSummaryWithOpenAI = async (vitals) => {
    const prompt = `
    Given the following health data of a person, generate three concise health recommendations in bullet points:
    
    - Name: ${vitals.firstName} ${vitals.lastName}
    - Age: ${vitals.age}
    - Sex: ${vitals.sex}
    - Heart Rate: ${vitals.heartRate} BPM
    - Fitness Level: ${vitals.fitnessLevel}
    - Blood Pressure: ${vitals.bloodPressure}
    - Steps Taken: ${vitals.stepsTaken}
    
    Format the response as follows:
    
    🔹 **Health Recommendations for ${vitals.firstName} ${vitals.lastName}**  
    
    - 🚶‍♀️ **Boost Activity**: (Brief recommendation about steps/exercise).  
    - ❤️ **Stay Consistent**: (Encouragement for maintaining heart rate & BP).  
    - 🔍 **Monitor Regularly**: (General advice on monitoring vitals).  
    `;

    // Only attempt to call OpenAI if the client was properly initialized
    if (openai) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o", // This is a valid model name as of March 2025
                messages: [
                    { role: "system", content: "You are a healthcare assistant providing concise health recommendations." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 150,
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error("Error generating recommendations with OpenAI:", error.message);
            // Log additional details for debugging if available
            if (error.response) {
                console.error("OpenAI API response status:", error.response.status);
                console.error("OpenAI API response data:", error.response.data);
            }
        }
    } else {
        console.warn("OpenAI client not initialized, using fallback recommendations");
    }
    
    // Fallback response with consistent formatting
    return `🔹 **Health Recommendations for ${vitals.firstName} ${vitals.lastName}**  

- 🚶‍♀️ **Boost Activity**: Aim for 7,500+ steps daily for better endurance and metabolism.  
- ❤️ **Stay Consistent**: Maintain heart rate and blood pressure with regular movement.  
- 🔍 **Monitor Regularly**: No concerns detected, but routine check-ups are encouraged.`;
};

/**
 * Main function that generates a complete set of random vitals data for a user
 * Includes personal information, health metrics, and AI-generated recommendations
 * @returns {Object} - Complete vitals data object
 */
const generateRandomVitals = async () => {
    const user = staticUsers[Math.floor(Math.random() * staticUsers.length)];
    const { heartRate, fitnessLevel } = getHeartRateAndFitness(user.sex, user.age);

    // Generate random blood pressure values (systolic/diastolic)
    const systolic = Math.floor(Math.random() * 50) + 80; // 80-130 range
    const diastolic = Math.floor(Math.random() * 30) + 60; // 60-90 range
    
    const vitals = {
        timestamp: new Date().toISOString(),
        ...user,
        heartRate,
        fitnessLevel,
        bloodPressure: `${systolic}/${diastolic}`,
        stepsTaken: Math.floor(Math.random() * 10000),
    };
    vitals.notes = await generateSummaryWithOpenAI(vitals);
    return vitals;
};

export default generateRandomVitals;
