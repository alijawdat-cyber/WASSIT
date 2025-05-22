import React from 'react';
import { DisputeReply, User } from '@/types';
import DisputeReplyItem from './DisputeReplyItem';
import Card from '@/components/ui/Card';

interface DisputeReplyListProps {
  replies: DisputeReply[];
  currentUser?: User;
}

const DisputeReplyList: React.FC<DisputeReplyListProps> = ({ replies, currentUser }) => {
  if (!replies || replies.length === 0) {
    return (
      <Card className="mt-4">
        <div className="text-center py-6">
          <p className="text-gray-500">لا توجد ردود على هذا النزاع بعد.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="سجل الردود" 
      subtitle={`${replies.length} رد`}
      className="mt-4"
    >
      <div className="space-y-1">
        {Array.isArray(replies) && replies.map((reply) => (
          <DisputeReplyItem
            key={reply.id}
            reply={reply}
            currentUser={currentUser}
          />
        ))}
      </div>
    </Card>
  );
};

export default DisputeReplyList; 