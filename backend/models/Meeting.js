const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    joinTime: {
        type: Date
    },
    leaveTime: {
        type: Date
    }
});

const meetingSchema = new mongoose.Schema({
    meetingId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    recordingEnabled: {
        type: Boolean,
        default: false
    },
    recordingUrl: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    participants: [participantSchema],
    status: {
        type: String,
        enum: ['scheduled', 'active', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});

// Add index for efficient queries
meetingSchema.index({ host: 1, startTime: 1 });
meetingSchema.index({ 'participants.email': 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;