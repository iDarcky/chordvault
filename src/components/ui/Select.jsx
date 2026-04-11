import React from 'react';
import { Select as HeroSelect, ListBoxItem as HeroSelectItem } from "@heroui/react";
import { cn } from '../../lib/utils';

// We map Radix API to HeroUI. Since Radix is quite different, we have to create a wrapper that approximates the usage.
// Radix usage looks like:
// <Select value={val} onValueChange={setVal}>
//   <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
//   <SelectContent>
//     <SelectItem value="1">One</SelectItem>
//   </SelectContent>
// </Select>
//
// We will convert this custom UI wrapper into a direct HeroSelect.
// This requires parsing children.

const SelectItem = ({ value, children, ...props }) => {
  return <HeroSelectItem key={value} value={value} {...props}>{children}</HeroSelectItem>;
}

// Dummy components for API compatibility. The actual rendering happens in the root Select.
const SelectGroup = ({ children }) => <>{children}</>;
const SelectValue = ({ placeholder }) => <>{placeholder}</>;
const SelectTrigger = ({ children }) => <>{children}</>;
const SelectContent = ({ children }) => <>{children}</>;

const Select = React.forwardRef(({
  value,
  onValueChange,

  children,
  className,
  disabled,
  ...props
}, ref) => {

  // Extract items and placeholder from children
  let placeholder = "Select an option";
  const items = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;

    if (child.type === SelectTrigger) {
      React.Children.forEach(child.props.children, triggerChild => {
        if (React.isValidElement(triggerChild) && triggerChild.type === SelectValue) {
          if (triggerChild.props.placeholder) placeholder = triggerChild.props.placeholder;
        }
      });
    }

    if (child.type === SelectContent) {
      React.Children.forEach(child.props.children, contentChild => {
        if (!React.isValidElement(contentChild)) return;

        if (contentChild.type === SelectItem) {
          items.push({
            value: contentChild.props.value,
            label: contentChild.props.children
          });
        }
      });
    }
  });

  return (
    <HeroSelect
      ref={ref}
      variant="bordered"
      placeholder={placeholder}
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const val = Array.from(keys)[0];
        if (val && onValueChange) onValueChange(val);
      }}
      isDisabled={disabled}
      className={cn("w-full", className)}
      {...props}
    >
      {items.map(item => (
        <HeroSelectItem key={item.value} value={item.value} textValue={typeof item.label === 'string' ? item.label : String(item.value)}>
          {item.label}
        </HeroSelectItem>
      ))}
    </HeroSelect>
  );
});

Select.displayName = "Select";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
};
