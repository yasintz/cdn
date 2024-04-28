import { useNavigate, useParams } from 'react-router-dom';
import { ItemEditCreate } from 'src/app/mesai-takip/components/ItemCreateEdit/ItemCreateEdit';
import { ItemType, useStore } from 'src/app/mesai-takip/useStore';
import { routePaths } from 'src/app/mesai-takip/utils/routes';

export const CreateEdit = () => {
  const navigate = useNavigate();
  const { editId } = useParams<{ editId?: string }>();
  const { items, addItem, updateItem, removeItem } = useStore();

  const selectedItem = items.find((i) => i.id === editId);

  const closePage = () => navigate(routePaths.home(), { replace: true });

  const saveItem = (item: Omit<ItemType, 'id'>) => {
    if (editId) {
      updateItem(editId, item);
    } else {
      addItem({
        id: Math.random().toString(36).substring(2, 7),
        ...item,
      });
    }

    closePage();
  };

  const onRemove = () => {
    closePage();
    setTimeout(() => {
      removeItem(editId!);
    }, 0);
  };

  return (
    <ItemEditCreate
      key={selectedItem?.id}
      item={selectedItem}
      onSave={saveItem}
      onRemove={editId ? onRemove : undefined}
    />
  );
};
