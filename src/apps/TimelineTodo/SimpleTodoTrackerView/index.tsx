import { useEffect, useLayoutEffect, useState } from 'react';
// @ts-expect-error type definition is missing
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, PlayCircleIcon, XCircleIcon } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '@/lib/utils';

export default function SimpleTodoTracker() {
  const [todos, setTodos] = useStore((s) => [
    s.simpleTodoList,
    s.updateSimpleTodoList,
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const addTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.trim() !== '') {
      setTodos([
        ...todos,
        {
          id: Date.now().toString(),
          text: newTodo,
          status: 'backlog',
          date: selectedDate,
        },
      ]);
      setNewTodo('');
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const newTodos = Array.from(todos);
    const [reorderedItem] = newTodos.splice(result.source.index, 1);
    reorderedItem.status = result.destination.droppableId;
    newTodos.splice(result.destination.index, 0, reorderedItem);

    setTodos(newTodos);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const renderDayHeaders = () => {
    const today = new Date();
    const daysInMonth = getDaysInMonth(today);
    const dayHeaders = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      dayHeaders.push(
        <div
          key={i}
          className="w-10 h-10 p-0"
          data-day-selected={dateString === selectedDate}
        >
          <Button
            variant={dateString === selectedDate ? 'default' : 'outline'}
            onClick={() => setSelectedDate(dateString)}
          >
            {i}
          </Button>
        </div>
      );
    }

    return dayHeaders;
  };

  useLayoutEffect(() => {
    const selectedDay = document.querySelector('div[data-day-selected="true"]');

    if (selectedDay) {
      selectedDay.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  }, []);

  return (
    <div>
      <div className="flex pt-4 pb-2 px-4 mb-2 overflow-x-scroll gap-3">
        {renderDayHeaders()}
      </div>
      <div className="container mx-auto p-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['backlog', 'inProgress', 'done'].map((status) => (
              <Droppable
                key={status}
                droppableId={status}
                isDropDisabled={false}
                isCombineEnabled={false}
                ignoreContainerClipping={false}
              >
                {(provided: any) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      'bg-gray-100 p-4 rounded-lg',
                      status === 'done' && 'opacity-70'
                    )}
                  >
                    <h2 className="text-lg font-semibold mb-4 capitalize">
                      {status === 'inProgress' ? 'In Progress' : status}
                    </h2>
                    {todos
                      .filter(
                        (todo) =>
                          todo.status === status && todo.date === selectedDate
                      )
                      .map((todo, index) => (
                        <Draggable
                          key={todo.id}
                          draggableId={todo.id}
                          index={index}
                        >
                          {(provided: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-2 mb-2 rounded shadow cursor-pointer flex justify-between items-center"
                            >
                              <span>{todo.text}</span>
                              <div className="flex gap-3">
                                {status === 'backlog' && (
                                  <PlayCircleIcon
                                    className="size-4 cursor-pointer"
                                    onClick={() =>
                                      setTodos(
                                        todos.map((t) =>
                                          t.id === todo.id
                                            ? { ...t, status: 'inProgress' }
                                            : t
                                        )
                                      )
                                    }
                                  />
                                )}

                                {status === 'inProgress' && (
                                  <CheckCircleIcon
                                    className="size-4 cursor-pointer"
                                    onClick={() =>
                                      setTodos(
                                        todos.map((t) =>
                                          t.id === todo.id
                                            ? { ...t, status: 'done' }
                                            : t
                                        )
                                      )
                                    }
                                  />
                                )}
                                <XCircleIcon
                                  className="size-4 cursor-pointer"
                                  onClick={() =>
                                    setTodos(
                                      todos.filter((t) => t.id !== todo.id)
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                    {status === 'backlog' && (
                      <Input
                        type="text"
                        placeholder="Add your todo..."
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onKeyPress={addTodo}
                        className="mt-2"
                      />
                    )}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
