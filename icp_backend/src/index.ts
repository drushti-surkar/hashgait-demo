import { Canister, query, update, text, Record, StableBTreeMap, Vec, Result, ic, nat64, bool } from 'azle';
import { v4 as uuidv4 } from 'uuid';

const BehavioralPattern = Record({
    id: text,
    userId: text,
    patternHash: text,
    confidenceScore: nat64,
    features: text,
    timestamp: nat64,
    deviceId: text
});

const AuthenticationResult = Record({
    success: bool,
    confidenceScore: nat64,
    message: text,
    timestamp: nat64
});

let behavioralPatterns = StableBTreeMap(0);
let userPatterns = StableBTreeMap(1);

export default Canister({
    saveBehavioralPattern: update([text, text, text, text], Result(text, text), (userId, patternHash, featuresJson, deviceId) => {
        try {
            const patternId = uuidv4();
            const timestamp = ic.time();
            const confidenceScore = BigInt(Math.floor(Math.random() * 40 + 60));

            const newPattern = {
                id: patternId,
                userId: userId,
                patternHash: patternHash,
                confidenceScore: confidenceScore,
                features: featuresJson,
                timestamp: timestamp,
                deviceId: deviceId
            };

            behavioralPatterns.insert(patternId, newPattern);

            const existingPatterns = userPatterns.get(userId);
            if (existingPatterns) {
                userPatterns.insert(userId, [...existingPatterns, patternId]);
            } else {
                userPatterns.insert(userId, [patternId]);
            }

            return Result.Ok('Pattern saved successfully with ID: ' + patternId);
        } catch (error) {
            return Result.Err('Failed to save pattern: ' + error);
        }
    }),

    getBehavioralPatterns: query([text], Vec(BehavioralPattern), (userId) => {
        const patternIds = userPatterns.get(userId);
        if (!patternIds) return [];

        const patterns = [];
        for (const patternId of patternIds) {
            const pattern = behavioralPatterns.get(patternId);
            if (pattern) patterns.push(pattern);
        }

        return patterns;
    }),

    verifyBehavioralPattern: update([text, text, text], Result(AuthenticationResult, text), (userId, patternHash, deviceId) => {
        try {
            const patternIds = userPatterns.get(userId);
            if (!patternIds || patternIds.length === 0) {
                return Result.Err('No patterns found for user');
            }

            let bestMatch = 0;

            for (const patternId of patternIds) {
                const storedPattern = behavioralPatterns.get(patternId);
                if (storedPattern) {
                    const similarity = calculateSimilarity(patternHash, storedPattern.patternHash);
                    if (similarity > bestMatch) {
                        bestMatch = similarity;
                    }
                }
            }

            const threshold = 70;
            const success = bestMatch >= threshold;
            const confidenceScore = BigInt(Math.floor(bestMatch));

            const message = success
                ? 'Authentication successful. Pattern matches with ' + bestMatch + '% confidence.'
                : 'Authentication failed. Best match: ' + bestMatch + '% (threshold: ' + threshold + '%)';

            const result = {
                success: success,
                confidenceScore: confidenceScore,
                message: message,
                timestamp: ic.time()
            };

            return Result.Ok(result);
        } catch (error) {
            return Result.Err('Verification failed: ' + error);
        }
    }),

    clearUserPatterns: update([text], Result(text, text), (userId) => {
        try {
            const patternIds = userPatterns.get(userId);
            if (patternIds) {
                for (const patternId of patternIds) {
                    behavioralPatterns.remove(patternId);
                }
                userPatterns.remove(userId);
                return Result.Ok('Cleared ' + patternIds.length + ' patterns for user ' + userId);
            } else {
                return Result.Ok('No patterns found to clear');
            }
        } catch (error) {
            return Result.Err('Failed to clear patterns: ' + error);
        }
    }),

    healthCheck: query([], text, () => {
        return 'Behavioral Authentication Canister is running. Total patterns stored: ' + behavioralPatterns.len();
    })
});

function calculateSimilarity(hash1, hash2) {
    if (hash1.length !== hash2.length) return 0;

    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] === hash2[i]) matches++;
    }

    return Math.floor((matches / hash1.length) * 100);
}
