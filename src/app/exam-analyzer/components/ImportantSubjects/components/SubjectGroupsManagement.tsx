import React from 'react';
import { SubjectGroup } from '../../../useStore';

interface SubjectGroupsManagementProps {
  subjectGroups: SubjectGroup[];
  onEditGroup: (group: SubjectGroup) => void;
  onDeleteGroup: (groupId: string) => void;
}

export function SubjectGroupsManagement({
  subjectGroups,
  onEditGroup,
  onDeleteGroup
}: SubjectGroupsManagementProps) {
  if (subjectGroups.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span>🔗</span>
          <span>Konu Grupları ({subjectGroups.length})</span>
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjectGroups.map(group => (
          <SubjectGroupCard
            key={group.id}
            group={group}
            onEdit={() => onEditGroup(group)}
            onDelete={() => onDeleteGroup(group.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface SubjectGroupCardProps {
  group: SubjectGroup;
  onEdit: () => void;
  onDelete: () => void;
}

function SubjectGroupCard({ group, onEdit, onDelete }: SubjectGroupCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-800">{group.name}</h4>
          <p className="text-sm text-gray-600">{group.lesson}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-blue-500 hover:text-blue-700 p-1 transition-colors"
            title="Düzenle"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 p-1 transition-colors"
            title="Sil"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {group.subjects.length} konu içeriyor
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {group.subjects.slice(0, 3).map(subject => (
          <span key={subject} className="text-xs bg-gray-100 px-2 py-1 rounded">
            {subject.length > 15 ? `${subject.substring(0, 15)}...` : subject}
          </span>
        ))}
        {group.subjects.length > 3 && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            +{group.subjects.length - 3} daha
          </span>
        )}
      </div>
    </div>
  );
} 