import { Router } from "express";
import * as recordingController from "../controllers/recordingController.js";

const router = Router();

router.post("/start-recording", recordingController.startRecording);
router.post("/stop-recording", recordingController.stopRecording);
router.get("/recordings", recordingController.listRecordings);

export default router;
