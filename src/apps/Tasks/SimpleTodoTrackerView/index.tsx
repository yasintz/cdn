import { useStore } from '../store';
import ListView from './ListView';
import SelectedTodoView from './SelectedTodoView';
import { useSharedStore } from './store';

export default function SimpleTodoTracker() {
  const { tasks, addTask, views } = useStore();
  const { setSharedState } = useSharedStore();

  const workspaceId = 'default';
  const workspaceTasks = tasks.filter(
    (task) => task.workspaceId === workspaceId
  );

  const defaultView = views.find((view) => view.id === 'default');

  if (!defaultView) {
    return <div>Default view not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <ListView
        tasks={workspaceTasks}
        onAddTask={(name) => addTask(workspaceId, name)}
        view={defaultView}
        onTaskClick={(id) => setSharedState({ selectedTodoId: id })}
      />
      <SelectedTodoView />
    </div>
  );
}

export { SimpleTodoTracker as Component };
