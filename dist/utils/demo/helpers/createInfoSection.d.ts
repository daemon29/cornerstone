declare type InfoSectionOptions = {
    title?: string;
    ordered?: boolean;
};
interface InfoSection {
    /** Add an instruction item to the info section */
    addInstruction(text: string): InfoSection;
    /** Open a new nested section and move one level down */
    openNestedSection(subSectionOptions?: InfoSectionOptions): InfoSection;
    /** Close the current section and move one level up */
    closeNestedSection(): InfoSection;
}
/**
 * Create a new information section where instructions can be added to
 * @param container - HTML container element
 * @param options - Options
 * @returns An info section instance
 */
declare function createInfoSection(container: HTMLElement, options?: InfoSectionOptions): InfoSection;
export { createInfoSection as default, createInfoSection };
