export const useNotificationTrigger = () => {
  const createNotification = async (
    userId,
    title,
    message,
    type,
    relatedJobId = null
  ) => {
    // No backend - just log to console
    console.log("Notification:", {
      userId,
      title,
      message,
      type,
      relatedJobId,
    });
  };

  const notifyNewJob = async (job, excludeUserId) => {
    console.log("New job notification", {
      job,
      excludeUserId,
    });
  };

  const notifyJobApplication = async (job, courierName) => {
    console.log("Job application notification", {
      job,
      courierName,
    });
  };

  const notifyJobAssigned = async (job, customerName, courierName) => {
    console.log("Job assigned notification", {
      job,
      customerName,
      courierName,
    });
  };

  const notifyJobCompleted = async (job, customerName, courierName) => {
    console.log("Job completed notification", {
      job,
      customerName,
      courierName,
    });
  };

  return {
    createNotification,
    notifyNewJob,
    notifyJobApplication,
    notifyJobAssigned,
    notifyJobCompleted,
  };
};