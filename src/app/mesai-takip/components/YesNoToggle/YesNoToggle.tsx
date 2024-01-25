import cx from 'classnames';
import styles from './style.module.scss';

type YesNoToggleProps = {
  className?: string;
  title: string;
  status: boolean;
  onChange: (status: boolean) => void;
};

export const YesNoToggle = ({
  status,
  onChange,
  title,
  className,
}: YesNoToggleProps) => {
  return (
    <div className={cx(styles.container, className)}>
      <div className={styles.title}>{title}</div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={status}
          className="sr-only peer"
          onChange={() => onChange(!status)}
        />
        <div
          className={cx(
            "peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600",
            styles.toggle
          )}
        ></div>
        <span className={styles.answer}>{status ? 'Evet' : 'Hayir'}</span>
      </label>
    </div>
  );
};
