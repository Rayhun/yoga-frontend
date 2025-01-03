import Button from '../Button';

const PageHeaderQuickActions = ({ actions = [] }) => {
  return (
    <div className="flex gap-2">
      {actions.map(({ id, label, ...rest }) => (
        <Button key={id} {...rest}>
          {label ? <span>{label}</span> : null}
        </Button>
      ))}
    </div>
  );
};

export default PageHeaderQuickActions;
