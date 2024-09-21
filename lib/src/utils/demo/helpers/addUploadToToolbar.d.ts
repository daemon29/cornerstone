import { configElement } from './createElement';
interface configUpload extends configElement {
    id?: string;
    title: string;
    container?: HTMLElement;
    onChange: (files: FileList) => void;
    input?: configElement;
}
export default function addUploadToToolbar(config: configUpload): void;
export {};
