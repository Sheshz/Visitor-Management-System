const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const meetingChatController = require("../controllers/meetingChatController");
const { authenticateUser, authorizeHost } = require("../middleware/authenticateMiddleware");

// Meeting management routes (host only)
router.post("/create", authenticateUser, authorizeHost, meetingController.createMeeting);
router.get("/host", authenticateUser, authorizeHost, meetingController.getHostMeetings);
router.put("/:meetingId", authenticateUser, authorizeHost, meetingController.updateMeeting);
router.post("/:meetingId/participants", authenticateUser, authorizeHost, meetingController.addParticipants);
router.delete("/:meetingId/participants/:email", authenticateUser, authorizeHost, meetingController.removeParticipant);
router.put("/:meetingId/start", authenticateUser, authorizeHost, meetingController.startMeeting);
router.put("/:meetingId/end", authenticateUser, authorizeHost, meetingController.endMeeting);
router.put("/:meetingId/cancel", authenticateUser, authorizeHost, meetingController.cancelMeeting);

// Meeting participant routes (user only)
router.get("/user", authenticateUser, meetingController.getUserMeetings);
router.put("/:meetingId/respond", authenticateUser, meetingController.respondToInvitation);
router.post("/:meetingId/join", authenticateUser, meetingController.joinMeeting);
router.put("/:meetingId/leave", authenticateUser, meetingController.leaveMeeting);

// Common routes (both host and users)
router.get("/:meetingId", authenticateUser, meetingController.getMeetingById);

// Chat routes
router.post("/:meetingId/chat", authenticateUser, meetingChatController.sendMessage);
router.get("/:meetingId/chat", authenticateUser, meetingChatController.getChatMessages);

module.exports = router;
