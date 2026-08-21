import Button from '../Button';

const PageHeaderQuickActions = ({ actions = [] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ id, label, Icon, ...rest }) => (
        <Button key={id} Icon={Icon} {...rest}>
          {label ? <span>{label}</span> : null}
        </Button>
      ))}
    </div>
  );
};

export default PageHeaderQuickActions;
