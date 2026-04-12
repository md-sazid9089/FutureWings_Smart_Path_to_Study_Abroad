/**
 * Notification Utility Functions
 * Use these functions to create notifications throughout the application
 */

const prisma = require("../prisma/client");

/**
 * Create a notification for a user
 * @param {number} userId - User ID
 * @param {string} type - Notification type (subscription, visa, ai, admin-update, recommendation, application)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link for the notification
 * @returns {Promise<Object>} Created notification
 */
async function createNotification(userId, type, title, message, link = null) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Create multiple notifications for multiple users
 * @param {number[]} userIds - Array of user IDs
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link for the notification
 * @returns {Promise<Object>} Result of bulk create
 */
async function createBulkNotifications(userIds, type, title, message, link = null) {
  try {
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        link,
      })),
    });
    return notifications;
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    throw error;
  }
}

/**
 * Notification types and templates
 */
const notificationTemplates = {
  SUBSCRIPTION_UPGRADED: {
    type: "subscription",
    title: "Premium Subscription Active",
    message: (featureName) =>
      `Your ${featureName} premium subscription is now active!`,
  },
  SUBSCRIPTION_EXPIRING: {
    type: "subscription",
    title: "Subscription Expiring Soon",
    message: (daysLeft) =>
      `Your premium subscription expires in ${daysLeft} days. Renew now to maintain access.`,
  },
  PAYMENT_FAILED: {
    type: "subscription",
    title: "Payment Failed",
    message:
      "Your recent payment could not be processed. Please try again.",
  },
  NEW_AI_RECOMMENDATION: {
    type: "ai",
    title: "New AI Recommendation",
    message: (programName) =>
      `We found a great match: ${programName}. Check it out!`,
  },
  APPLICATION_UPDATED: {
    type: "application",
    title: "Your Application Was Updated",
    message: (universityName) =>
      `Status update on your application to ${universityName}.`,
  },
  VISA_OUTCOME_UPDATE: {
    type: "visa",
    title: "Visa Outcome Updated",
    message:
      "Your visa outcome has been updated. Check your applications for details.",
  },
  NEW_COUNTRY_ADDED: {
    type: "admin-update",
    title: "New Country Added",
    message: (countryName) =>
      `${countryName} has been added to our platform. Explore opportunities!`,
  },
  SCHOLARSHIP_MATCHING: {
    type: "recommendation",
    title: "Scholarship Found",
    message: (scholarshipName) =>
      `You may qualify for: ${scholarshipName}. Learn more.`,
  },
  DOCUMENT_VERIFIED: {
    type: "admin-update",
    title: "Document Verified",
    message: "Your submitted documents have been verified by our admins.",
  },
  CONSULTANCY_AVAILABLE: {
    type: "visa",
    title: "Visa Consultancy Available",
    message:
      "Premium visa consultancy services are now available for your destination.",
  },
};

module.exports = {
  createNotification,
  createBulkNotifications,
  notificationTemplates,
};
