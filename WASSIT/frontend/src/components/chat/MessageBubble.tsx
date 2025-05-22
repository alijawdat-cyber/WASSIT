interface MessageBubbleProps {
  content: string;
  isOutgoing: boolean;
  timestamp: string;
  senderName?: string;
}

export default function MessageBubble({
  content,
  isOutgoing,
  timestamp,
  senderName,
}: MessageBubbleProps) {
  // تنسيق الوقت
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-IQ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-3`}>
      <div 
        className={`max-w-[80%] rounded-lg p-3 ${
          isOutgoing 
            ? 'bg-primary text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        {!isOutgoing && senderName && (
          <div className="font-semibold text-xs mb-1">{senderName}</div>
        )}
        <div className="break-words">{content}</div>
        <div 
          className={`text-xs mt-1 text-right ${
            isOutgoing ? 'text-primary-100' : 'text-gray-500'
          }`}
        >
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
}
