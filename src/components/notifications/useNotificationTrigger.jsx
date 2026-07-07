import { base44 } from "@/api/base44Client";

export const useNotificationTrigger = () => {
  const createNotification = async (userId, title, message, type, relatedJobId = null) => {
    try {
      await base44.entities.Notification.create({
        user_id: userId,
        title,
        message,
        type,
        related_job_id: relatedJobId,
        is_read: false
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const notifyNewJob = async (job, excludeUserId) => {
    // In a real app, you'd query couriers based on location/preferences
    // For now, we'll just create a general notification
    // This could be enhanced to notify specific couriers
    console.log("New job posted, would notify relevant couriers");
  };

  const notifyJobApplication = async (job, courierName) => {
    await createNotification(
      job.customer_id,
      "New Application Received",
      `${courierName} has applied to deliver "${job.title}"`,
      "application_received",
      job.id
    );
  };

  const notifyJobAssigned = async (job, customerName, courierName) => {
    // Notify courier
    await createNotification(
      job.courier_id,
      "Job Assigned to You!",
      `You've been selected to deliver "${job.title}" for ${customerName}`,
      "job_assigned",
      job.id
    );
    
    // Notify customer
    await createNotification(
      job.customer_id,
      "Courier Assigned",
      `${courierName} will deliver your package "${job.title}"`,
      "job_assigned",
      job.id
    );
  };

  const notifyJobCompleted = async (job, customerName, courierName) => {
    // Notify customer
    await createNotification(
      job.customer_id,
      "Delivery Complete!",
      `${courierName} has completed delivery of "${job.title}"`,
      "job_completed",
      job.id
    );
    
    // Notify courier
    await createNotification(
      job.courier_id,
      "Delivery Confirmed",
      `Thank you for delivering "${job.title}" for ${customerName}`,
      "job_completed",
      job.id
    );
  };

  return {
    notifyNewJob,
    notifyJobApplication,
    notifyJobAssigned,
    notifyJobCompleted
  };
};