// Field length constants
export const FIELD_LENGTHS = {
    FULL_NAME: 100,
    ADDRESS: 200,
    EMAIL: 100,
    PHONE: 10,
    STUDENT_IDENTIFIER: 50,
    EMERGENCY_CONTACT: 10,
    DESCRIPTION: 500,
    NOTES: 1000,
};

// Input field maxLength attribute values
export const MAX_LENGTHS = {
    ...FIELD_LENGTHS
};

// Validation error messages
export const VALIDATION_MESSAGES = {
    FULL_NAME: `Full Name must not exceed ${FIELD_LENGTHS.FULL_NAME} characters`,
    ADDRESS: `Address must not exceed ${FIELD_LENGTHS.ADDRESS} characters`,
    EMAIL: `Email must not exceed ${FIELD_LENGTHS.EMAIL} characters`,
    PHONE: `Phone number must be exactly ${FIELD_LENGTHS.PHONE} digits`,
    STUDENT_IDENTIFIER: `Student Identifier must not exceed ${FIELD_LENGTHS.STUDENT_IDENTIFIER} characters`,
    EMERGENCY_CONTACT: `Emergency contact must be exactly ${FIELD_LENGTHS.EMERGENCY_CONTACT} digits`,
};