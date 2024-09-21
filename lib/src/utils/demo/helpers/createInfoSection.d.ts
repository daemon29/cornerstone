declare type InfoSectionOptions = {
    title?: string;
    ordered?: boolean;
};
interface InfoSection {
    addInstruction(text: string): InfoSection;
    openNestedSection(subSectionOptions?: InfoSectionOptions): InfoSection;
    closeNestedSection(): InfoSection;
}
declare function createInfoSection(container: HTMLElement, options?: InfoSectionOptions): InfoSection;
export { createInfoSection as default, createInfoSection };
