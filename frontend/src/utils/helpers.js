export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const getDeadlineCountdown = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;

  if (diff <= 0) return { text: 'Overdue', color: 'text-red-600', urgent: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 3) return { text: `${days}d ${hours}h left`, color: 'text-green-600', urgent: false };
  if (days > 0) return { text: `${days}d ${hours}h left`, color: 'text-yellow-600', urgent: true };
  if (hours > 0) return { text: `${hours}h ${minutes}m left`, color: 'text-orange-600', urgent: true };
  return { text: `${minutes}m left`, color: 'text-red-600', urgent: true };
};

export const getPlagiarismColor = (score) => {
  if (score < 20) return 'text-green-600 bg-green-50';
  if (score < 50) return 'text-yellow-600 bg-yellow-50';
  if (score < 70) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};

export const getPlagiarismLabel = (score) => {
  if (score < 20) return 'Original';
  if (score < 50) return 'Moderate';
  if (score < 70) return 'High';
  return 'Very High';
};
