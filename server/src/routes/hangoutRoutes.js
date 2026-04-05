const express = require("express");

const { requireAuth } = require("../middleware/requireAuth");
const {
  addExpense,
  closeHangout,
  createHangout,
  getHangoutDetails,
  joinHangout,
  listHangoutsForUser,
  recordSettlementPayment
} = require("../services/hangoutService");
const { createHttpError } = require("../utils/httpError");
const { decimalToPaise } = require("../utils/money");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const requestedStatus = req.query.status;
    const status =
      requestedStatus === "ACTIVE" || requestedStatus === "CLOSED"
        ? requestedStatus
        : undefined;

    const payload = await listHangoutsForUser(req.auth.userId, status);
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      throw createHttpError(400, "Hangout name is required.");
    }

    const hangout = await createHangout({
      name,
      creatorUserId: req.auth.userId
    });

    return res.status(201).json({ hangout });
  } catch (error) {
    return next(error);
  }
});

router.post("/join", async (req, res, next) => {
  try {
    const roomCode = req.body.roomCode?.trim();
    if (!roomCode) {
      throw createHttpError(400, "Room code is required.");
    }

    const hangout = await joinHangout({
      roomCode,
      userId: req.auth.userId
    });

    return res.json({ hangout });
  } catch (error) {
    return next(error);
  }
});

router.get("/:hangoutId", async (req, res, next) => {
  try {
    const hangout = await getHangoutDetails(req.params.hangoutId, req.auth.userId);
    return res.json({ hangout });
  } catch (error) {
    return next(error);
  }
});

router.post("/:hangoutId/expenses", async (req, res, next) => {
  try {
    const description = req.body.description?.trim();
    const payerId = req.body.payerId?.trim() || req.auth.userId;

    if (!description) {
      throw createHttpError(400, "Expense description is required.");
    }

    const amountPaise = Number.isInteger(req.body.amountPaise)
      ? req.body.amountPaise
      : decimalToPaise(req.body.amount);

    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
      throw createHttpError(400, "Amount must be a positive paise value.");
    }

    const hangout = await addExpense({
      hangoutId: req.params.hangoutId,
      description,
      amountPaise,
      payerId,
      actorUserId: req.auth.userId
    });

    return res.status(201).json({ hangout });
  } catch (error) {
    return next(error);
  }
});

router.post("/:hangoutId/close", async (req, res, next) => {
  try {
    const hangout = await closeHangout({
      hangoutId: req.params.hangoutId,
      userId: req.auth.userId
    });

    return res.json({ hangout });
  } catch (error) {
    return next(error);
  }
});

router.post("/:hangoutId/settlements/payments", async (req, res, next) => {
  try {
    const fromUserId = req.body.fromUserId?.trim();
    const toUserId = req.body.toUserId?.trim();
    const mode = req.body.mode === "full" ? "full" : "partial";

    if (!fromUserId || !toUserId) {
      throw createHttpError(400, "fromUserId and toUserId are required.");
    }

    const currentHangout = await getHangoutDetails(req.params.hangoutId, req.auth.userId);
    const settlement = currentHangout.summary.settlements.find(
      (item) => item.fromUserId === fromUserId && item.toUserId === toUserId
    );

    if (!settlement) {
      throw createHttpError(404, "No outstanding settlement exists for that pair.");
    }

    const amountPaise =
      mode === "full"
        ? settlement.remainingAmountPaise
        : Number.isInteger(req.body.amountPaise)
          ? req.body.amountPaise
          : decimalToPaise(req.body.amount);

    const hangout = await recordSettlementPayment({
      hangoutId: req.params.hangoutId,
      fromUserId,
      toUserId,
      amountPaise,
      actorUserId: req.auth.userId
    });

    return res.status(201).json({ hangout });
  } catch (error) {
    return next(error);
  }
});

module.exports = {
  hangoutRoutes: router
};
