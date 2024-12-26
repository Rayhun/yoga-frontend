const PageHeaderQuickActions = ({ actions = [] }) => {
  return (
    <div className="flex gap-2">
      {actions.map(({ id, Icon, label, ...rest }) => (
        <button
          {...rest}
          key={id}
          className="flex items-center justify-center gap-2 cursor-pointer text-sm bg-primary rounded-md py-2 px-3 text-white transition hover:bg-opacity-70"
        >
          {Icon ? <Icon size={18} /> : null}
          {label ? <span>{label}</span> : null}
        </button>
      ))}
    </div>
  );
};

export default PageHeaderQuickActions;
