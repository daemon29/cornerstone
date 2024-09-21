export default function addToggleButtonToToolbar({ id, title, container, onClick, defaultToggle, }: {
    id?: string;
    title: string;
    container?: HTMLElement;
    onClick: (toggle: boolean) => void;
    defaultToggle?: boolean;
}): void;
