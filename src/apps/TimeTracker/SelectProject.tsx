import { Combobox } from '@/components/ui/combobox';
import React, { useMemo, useState } from 'react';
import { ProjectType, useStore } from './store';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type SelectProjectProps = {
  projectId?: string;
  onChange: (projectId?: string) => void;
  className?: string;
};

const SelectProject = ({
  projectId,
  onChange,
  className,
}: SelectProjectProps) => {
  const { projects, createProject } = useStore();
  const [newProject, setNewProject] = useState<ProjectType>();
  const projectsWithNew = useMemo(
    () => (newProject ? [...projects, newProject] : projects),
    [newProject, projects]
  );

  const updateProjectId = (id: string) => {
    if (id && id === newProject?.id) {
      createProject(newProject);
      setNewProject(undefined);
    }

    onChange(id);
  };

  const onProjectSearchChange = (val: string) => {
    const cleanVal = val.trim();

    if (!cleanVal) {
      setNewProject(undefined);
      return;
    }

    const newId = cleanVal.toLowerCase().replace(/ /g, '-');
    const isExisting = projects.some((p) => p.id === newId);

    if (isExisting) {
      return;
    }

    setNewProject({
      id: newId,
      name: cleanVal,
    });
  };

  return (
    <Combobox
      options={projectsWithNew.map((p) => ({
        label: p.name,
        value: p.id,
      }))}
      value={projectId || ''}
      setValue={updateProjectId}
      className={cn('w-auto lg:w-60 lg:flex-2', className)}
      onSearchChange={onProjectSearchChange}
      renderOption={(option) => (
        <>
          <div className="flex gap-2">
            {option.label}
            {option.value === newProject?.id && (
              <span className="text-gray-400">({newProject.id})</span>
            )}
          </div>
          <CheckIcon
            className={cn(
              'ml-auto h-4 w-4',
              projectId === option.value ? 'opacity-100' : 'opacity-0'
            )}
          />
        </>
      )}
    />
  );
};

export default SelectProject;
