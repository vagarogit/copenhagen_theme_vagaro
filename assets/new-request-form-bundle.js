import { j as jsxRuntimeExports, r as reactExports, u as useTranslation, s as styled, D as DOMPurify, m as mime, a as useDropzone, b as useGrid, S as SvgAlertWarningStroke, c as SvgCreditCardStroke, W as We, d as SvgCheckCircleStroke, e as useModalContainer, f as addFlashNotification, i as initI18next, l as loadTranslations, g as reactDomExports, T as ThemeProviders, h as createTheme } from 'shared';
import { Field, Label, Hint, Input as Input$1, Message, Textarea, Checkbox as Checkbox$1, FileList, File, FileUpload, FauxInput, MediaInput } from '@zendeskgarden/react-forms';
import { Span, Paragraph } from '@zendeskgarden/react-typography';
import { useToast, Notification, Title, Close, Alert } from '@zendeskgarden/react-notifications';
import { Field as Field$1, Label as Label$1, Hint as Hint$1, Combobox, Option, Message as Message$1, OptGroup } from '@zendeskgarden/react-dropdowns.next';
import { Anchor, Button } from '@zendeskgarden/react-buttons';
import { Progress } from '@zendeskgarden/react-loaders';
import { Tooltip } from '@zendeskgarden/react-tooltips';
import { Datepicker } from '@zendeskgarden/react-datepickers';
import { Tag } from '@zendeskgarden/react-tags';
import { focusStyles, getColorV8 } from '@zendeskgarden/react-theming';
import { Header, Modal, Body, Footer as Footer$1, FooterItem, Close as Close$1 } from '@zendeskgarden/react-modals';
import { Accordion } from '@zendeskgarden/react-accordions';

function Input({ field, onChange }) {
    const { label, error, value, name, required, description, type } = field;
    const stepProp = {};
    const inputType = type === "integer" || type === "decimal" ? "number" : "text";
    if (type === "integer")
        stepProp.step = "1";
    if (type === "decimal")
        stepProp.step = "any";
    const autocomplete = type === "anonymous_requester_email" ? "email" : undefined;
    return (jsxRuntimeExports.jsxs(Field, { children: [jsxRuntimeExports.jsxs(Label, { children: [label, required && jsxRuntimeExports.jsx(Span, { "aria-hidden": "true", children: "*" })] }), description && (jsxRuntimeExports.jsx(Hint, { dangerouslySetInnerHTML: { __html: description } })), jsxRuntimeExports.jsx(Input$1, { name: name, type: inputType, defaultValue: value, validation: error ? "error" : undefined, required: required, onChange: (e) => {
                    onChange && onChange(e.target.value);
                }, autoComplete: autocomplete, ...stepProp }), error && jsxRuntimeExports.jsx(Message, { validation: "error", children: error })] }));
}

function useWysiwyg({ hasWysiwyg, baseLocale, hasAtMentions, userRole, brandId, }) {
    const isInitializedRef = reactExports.useRef(false);
    const { addToast } = useToast();
    const { t } = useTranslation();
    return reactExports.useCallback(async (ref) => {
        if (hasWysiwyg && ref && !isInitializedRef.current) {
            isInitializedRef.current = true;
            const { createEditor } = await import('@zendesk/help-center-wysiwyg');
            const editor = await createEditor(ref, {
                editorType: "supportRequests",
                hasAtMentions,
                userRole,
                brandId,
                baseLocale,
            });
            const notifications = editor.plugins.get("Notification");
            // Handle generic notifications and errors with "toast" notifications
            notifications.on("show", (event, data) => {
                event.stop(); // Prevent the default notification from being shown via window.alert
                const message = data.message instanceof Error
                    ? data.message.message
                    : data.message;
                const { type, title } = data;
                addToast(({ close }) => (jsxRuntimeExports.jsxs(Notification, { type: type, children: [jsxRuntimeExports.jsx(Title, { children: title }), message, jsxRuntimeExports.jsx(Close, { "aria-label": t("new-request-form.close-label", "Close"), onClick: close })] })));
            });
        }
    }, [hasWysiwyg, baseLocale, hasAtMentions, userRole, brandId, addToast, t]);
}

const StyledField = styled(Field) `
  .ck.ck-editor {
    margin-top: ${(props) => props.theme.space.xs};
  }
`;
const StyledMessage = styled(Message) `
  .ck.ck-editor + & {
    margin-top: ${(props) => props.theme.space.xs};
  }
`;
function TextArea({ field, hasWysiwyg, baseLocale, hasAtMentions, userRole, brandId, onChange, }) {
    const { label, error, value, name, required, description } = field;
    const ref = useWysiwyg({
        hasWysiwyg,
        baseLocale,
        hasAtMentions,
        userRole,
        brandId,
    });
    return (jsxRuntimeExports.jsxs(StyledField, { children: [jsxRuntimeExports.jsxs(Label, { children: [label, required && jsxRuntimeExports.jsx(Span, { "aria-hidden": "true", children: "*" })] }), description && (jsxRuntimeExports.jsx(Hint, { dangerouslySetInnerHTML: { __html: description } })), jsxRuntimeExports.jsx(Textarea, { ref: ref, name: name, defaultValue: value, validation: error ? "error" : undefined, required: required, onChange: (e) => onChange(e.target.value), rows: 6, isResizable: true }), error && jsxRuntimeExports.jsx(StyledMessage, { validation: "error", children: error })] }));
}

function EmptyValueOption() {
    const { t } = useTranslation();
    return (jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx(Span, { "aria-hidden": "true", children: "-" }), jsxRuntimeExports.jsx(Span, { hidden: true, children: t("new-request-form.dropdown.empty-option", "Select an option") })] }));
}

function DropDown({ field, onChange }) {
    const { label, options, error, value, name, required, description } = field;
    const selectionValue = value == null ? "" : value.toString();
    const wrapperRef = reactExports.useRef(null);
    reactExports.useEffect(() => {
        if (wrapperRef.current && required) {
            const combobox = wrapperRef.current.querySelector("[role=combobox]");
            combobox?.setAttribute("aria-required", "true");
        }
    }, [wrapperRef, required]);
    return (jsxRuntimeExports.jsxs(Field$1, { children: [jsxRuntimeExports.jsxs(Label$1, { children: [label, required && jsxRuntimeExports.jsx(Span, { "aria-hidden": "true", children: "*" })] }), description && (jsxRuntimeExports.jsx(Hint$1, { dangerouslySetInnerHTML: { __html: description } })), jsxRuntimeExports.jsxs(Combobox, { ref: wrapperRef, inputProps: { name, required }, isEditable: false, validation: error ? "error" : undefined, inputValue: selectionValue, selectionValue: selectionValue, renderValue: ({ selection }) => selection?.label || jsxRuntimeExports.jsx(EmptyValueOption, {}), onChange: ({ selectionValue }) => {
                    if (selectionValue !== undefined) {
                        onChange(selectionValue);
                    }
                }, children: [!required && (jsxRuntimeExports.jsx(Option, { value: "", label: "-", children: jsxRuntimeExports.jsx(EmptyValueOption, {}) })), options.map((option) => (jsxRuntimeExports.jsx(Option, { value: option.value.toString(), label: option.name }, option.value)))] }), error && jsxRuntimeExports.jsx(Message$1, { validation: "error", children: error })] }));
}

function Checkbox({ field, onChange }) {
    const { label, error, value, name, required, description } = field;
    const [checkboxValue, setCheckboxValue] = reactExports.useState(value);
    const handleChange = (e) => {
        const { checked } = e.target;
        setCheckboxValue(checked);
        onChange(checked);
    };
    return (jsxRuntimeExports.jsxs(Field, { children: [jsxRuntimeExports.jsx("input", { type: "hidden", name: name, value: "off" }), jsxRuntimeExports.jsxs(Checkbox$1, { name: name, required: required, defaultChecked: value, value: checkboxValue ? "on" : "off", onChange: handleChange, children: [jsxRuntimeExports.jsxs(Label, { children: [label, required && jsxRuntimeExports.jsx(Span, { "aria-hidden": "true", children: "*" })] }), description && (jsxRuntimeExports.jsx(Hint, { dangerouslySetInnerHTML: { __html: description } }))] }), error && jsxRuntimeExports.jsx(Message, { validation: "error", children: error })] }));
}

/**
 * The root group is identified by an empty string, to avoid possible clashes with a level with
 * a "Root" name.
 */
const ROOT_GROUP_IDENTIFIER = "[]";
function getGroupIdentifier(names) {
    return `[${names.join("::")}]`;
}
function isGroupIdentifier(name) {
    return name.startsWith("[") && name.endsWith("]");
}
function getGroupAndOptionNames(input) {
    const namesList = input.split("::");
    return [namesList.slice(0, -1), namesList.slice(-1)[0]];
}
function buildSubGroupOptions(groupNames) {
    const parentGroupNames = groupNames.slice(0, -1);
    const parentGroupIdentifier = getGroupIdentifier(parentGroupNames);
    const name = groupNames[groupNames.length - 1];
    return {
        type: "SubGroup",
        name,
        backOption: {
            type: "previous",
            label: "Back",
            value: parentGroupIdentifier,
        },
        options: [],
    };
}
/**
 * Maps a flat list of options to a nested structure
 *
 * For example, given the following options:
 * [
 *  { "name": "Bass::Fender::Precision", "value": "bass__fender__precision" },
 *  { "name": "Bass::Fender::Jazz", "value": "bass__fender__jazz" }
 *  { "name": "Drums", "value": "drums" },
 * ]
 *
 * The following nested structure will be returned:
 * {
 *  "[]": {
 *   "type": "RootGroup",
 *   "options": [
 *    { "label": "Bass", "value": "[Bass]", type: "next" },
 *    { "label": "Drums", "value": "drums" },
 *   ]
 *  },
 *  "[Bass]": {
 *   "type": "SubGroup",
 *   "name": "Bass",
 *   "backOption": { "type": "previous", "label": "Back", "value": "[]" },
 *   "options": [
 *    { "label": "Fender", "value": "[Bass::Fender]", type: "next" },
 *   ]
 *  },
 *  "[Bass::Fender]": {
 *   "type": "SubGroup",
 *   "name": "Fender",
 *   "backOption": { "type": "previous", "label": "Back", "value": "[Bass]" },
 *   "options": [
 *    { "menuLabel": "Precision", "label": "Bass > Fender > Precision", "value": "bass__fender__precision" },
 *    { "menuLabel": "Jazz", "label": "Bass > Fender > Jazz", "value": "bass__fender__jazz" },
 *   ]
 *  }
 * }
 *
 * @param options original field options
 * @param hasEmptyOption if true, adds an empty option to the root group
 * @returns nested options
 */
function buildNestedOptions(options, hasEmptyOption) {
    const result = {
        [ROOT_GROUP_IDENTIFIER]: {
            type: "RootGroup",
            options: hasEmptyOption ? [{ label: "-", value: "" }] : [],
        },
    };
    options.forEach((option) => {
        const { name, value } = option;
        if (!name.includes("::")) {
            result[ROOT_GROUP_IDENTIFIER].options.push({
                value,
                label: name,
            });
        }
        else {
            const [groupNames, optionName] = getGroupAndOptionNames(name);
            const groupIdentifier = getGroupIdentifier(groupNames);
            if (!result[groupIdentifier]) {
                result[groupIdentifier] = buildSubGroupOptions(groupNames);
            }
            result[groupIdentifier]?.options.push({
                value,
                label: name.split("::").join(" > "),
                menuLabel: optionName,
            });
            // creates next options for each parent group, if they don't already exists
            for (let i = 0; i < groupNames.length; i++) {
                const parentGroupNames = groupNames.slice(0, i);
                const nextGroupNames = groupNames.slice(0, i + 1);
                const parentGroupIdentifier = getGroupIdentifier(parentGroupNames);
                const nextGroupIdentifier = getGroupIdentifier(nextGroupNames);
                if (!result[parentGroupIdentifier]) {
                    result[parentGroupIdentifier] =
                        buildSubGroupOptions(parentGroupNames);
                }
                if (result[parentGroupIdentifier]?.options.find((o) => o.value === nextGroupIdentifier) === undefined) {
                    result[parentGroupIdentifier]?.options.push({
                        type: "next",
                        label: nextGroupNames[nextGroupNames.length - 1],
                        value: nextGroupIdentifier,
                    });
                }
            }
        }
    });
    return result;
}
/**
 * When one or more options are selected, the Combobox component renders the label
 * for an option in the input, searching for an option passed as a child with the
 * same value as the selected option.
 *
 * In the first render we are passing only the root group options as children,
 * and if we already have some selected values from a SubGroup, the component is not
 * able to find the label for the selected option.
 *
 * We therefore need to pass all the non-navigation options as children in the first render.
 * The passed options are cached by the Combobox component, so we can safely remove them
 * after the first render and pass only the root group options.
 */
function getInitialGroup(nestedOptions) {
    const result = {
        type: "RootGroup",
        options: [],
    };
    Object.values(nestedOptions).forEach(({ options }) => {
        result.options.push(...options.filter(({ type }) => type === undefined));
    });
    return result;
}
function useNestedOptions({ options, hasEmptyOption, }) {
    const nestedOptions = reactExports.useMemo(() => buildNestedOptions(options, hasEmptyOption), [options, hasEmptyOption]);
    const [currentGroup, setCurrentGroup] = reactExports.useState(getInitialGroup(nestedOptions));
    reactExports.useEffect(() => {
        setCurrentGroup(nestedOptions[ROOT_GROUP_IDENTIFIER]);
    }, [nestedOptions]);
    const setCurrentGroupByIdentifier = (identifier) => {
        const group = nestedOptions[identifier];
        if (group) {
            setCurrentGroup(group);
        }
    };
    return {
        currentGroup,
        isGroupIdentifier,
        setCurrentGroupByIdentifier,
    };
}

function MultiSelect({ field }) {
    const { label, options, error, value, name, required, description } = field;
    const { currentGroup, isGroupIdentifier, setCurrentGroupByIdentifier } = useNestedOptions({
        options,
        hasEmptyOption: false,
    });
    const [selectedValues, setSelectValues] = reactExports.useState(value || []);
    const wrapperRef = reactExports.useRef(null);
    reactExports.useEffect(() => {
        if (wrapperRef.current && required) {
            const combobox = wrapperRef.current.querySelector("[role=combobox]");
            combobox?.setAttribute("aria-required", "true");
        }
    }, [wrapperRef, required]);
    const handleChange = (changes) => {
        if (Array.isArray(changes.selectionValue)) {
            const lastSelectedItem = changes.selectionValue.slice(-1).toString();
            if (isGroupIdentifier(lastSelectedItem)) {
                setCurrentGroupByIdentifier(lastSelectedItem);
            }
            else {
                setSelectValues(changes.selectionValue);
            }
        }
    };
    return (jsxRuntimeExports.jsxs(Field$1, { children: [selectedValues.map((selectedValue) => (jsxRuntimeExports.jsx("input", { type: "hidden", name: `${name}[]`, value: selectedValue }, selectedValue))), jsxRuntimeExports.jsxs(Label$1, { children: [label, required && jsxRuntimeExports.jsx(Span, { "aria-hidden": "true", children: "*" })] }), description && (jsxRuntimeExports.jsx(Hint$1, { dangerouslySetInnerHTML: { __html: description } })), jsxRuntimeExports.jsxs(Combobox, { ref: wrapperRef, isMultiselectable: true, inputProps: { required }, isEditable: false, validation: error ? "error" : undefined, onChange: handleChange, selectionValue: selectedValues, maxHeight: "auto", children: [currentGroup.type === "SubGroup" && (jsxRuntimeExports.jsx(Option, { ...currentGroup.backOption })), currentGroup.type === "SubGroup" ? (jsxRuntimeExports.jsx(OptGroup, { "aria-label": currentGroup.name, children: currentGroup.options.map((option) => (jsxRuntimeExports.jsx(Option, { ...option, children: option.menuLabel ?? option.label }, option.value))) })) : (currentGroup.options.map((option) => (jsxRuntimeExports.jsx(Option, { ...option }, option.value))))] }), error && jsxRuntimeExports.jsx(Message$1, { validation: "error", children: error })] }));
}

const key = "return-focus-to-ticket-form-field";
function TicketFormField({ field, newRequestPath, }) {
    const ref = reactExports.createRef();
    const handleChange = ({ selectionValue }) => {
        if (selectionValue && typeof selectionValue === "number") {
            const url = new URL(window.location.href);
            const searchParams = url.searchParams;
            searchParams.set("ticket_form_id", selectionValue);
            sessionStorage.setItem(key, "true");
            window.location.assign(`${newRequestPath}${url.search}`);
        }
    };
    reactExports.useEffect(() => {
        if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key);
            // return focus to the ticket form field dropdown
            // after the page reloads for better a11y
            ref.current?.firstChild?.focus();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return (jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx("input", { type: "hidden", name: field.name, value: field.value }), field.options.length > 1 && (jsxRuntimeExports.jsxs(Field$1, { children: [jsxRuntimeExports.jsx(Label$1, { children: field.label }), jsxRuntimeExports.jsx(Combobox, { isEditable: false, onChange: handleChange, ref: ref, children: field.options.map((option) => (jsxRuntimeExports.jsx(Option, { value: option.value, label: option.name, isSelected: field.value === option.value, children: option.name }, option.value))) })] }))] }));
}

function ParentTicketField({ field, }) {
    const { value, name } = field;
    return jsxRuntimeExports.jsx("input", { type: "hidden", name: name, value: value });
}

// NOTE: This is a temporary handling of the CSRF token
async function fetchCsrfToken$1() {
    const response = await fetch("/api/v2/help_center/sessions.json");
    const { current_session } = await response.json();
    return current_session.csrf_token;
}

/**
 * This hook creates a ref callback used to override the submit method of the form
 * that uses the callback.
 * Before submitting the form, it fetches the CSRF token from the backend and appends it to the form,
 * and redacts the value of the eventual credit card field
 * @param ticketFields array of ticket fields for the form
 * @returns a Ref callback and a submit handler
 */
function useFormSubmit(ticketFields) {
    const initialized = reactExports.useRef(false);
    const isSubmitting = reactExports.useRef(false);
    const formRefCallback = reactExports.useCallback((ref) => {
        if (ref && !initialized.current) {
            initialized.current = true;
            /* We are monkey patching the submit method of the form, since this behavior is what
               other scripts in Help Center are intercepting the submit event, stopping the event propagation and
               calling the submit method directly */
            ref.submit = async () => {
                /* We are performing an async call to fetch the CSRF token and for this reason
                 the submit is not immediate, and the user can click the submit button multiple times.
                 We don't want to disable the submit button for A11Y, so we use the isSubmitting ref
                 to stop subsequent submits after the first one. */
                if (isSubmitting.current === false) {
                    isSubmitting.current = true;
                    const token = await fetchCsrfToken$1();
                    const hiddenInput = document.createElement("input");
                    hiddenInput.type = "hidden";
                    hiddenInput.name = "authenticity_token";
                    hiddenInput.value = token;
                    ref.appendChild(hiddenInput);
                    // The backend expects the credit card field to have a length at least of 13 characters.
                    // We are prefixing the 4 digits with 9 Xs to make sure the value has the expected length
                    const creditCardFields = ticketFields.filter((field) => field.type === "partialcreditcard");
                    for (const creditCardField of creditCardFields) {
                        const creditCardInput = ref.querySelector(`input[name="${creditCardField.name}"]`);
                        if (creditCardInput &&
                            creditCardInput instanceof HTMLInputElement &&
                            creditCardInput.value.length === 4) {
                            creditCardInput.value = `XXXXXXXXX${creditCardInput.value}`;
                        }
                    }
                    HTMLFormElement.prototype.submit.call(ref);
                }
            };
        }
    }, [ticketFields]);
    const handleSubmit = (e) => {
        e.preventDefault();
        e.target.submit();
    };
    return { formRefCallback, handleSubmit };
}

const MAX_URL_LENGTH = 2048;
const TICKET_FIELD_PREFIX = "tf_";
const ALLOWED_BOOLEAN_VALUES = ["true", "false"];
const ALLOWED_HTML_TAGS = [
    "pre",
    "strong",
    "b",
    "p",
    "blockquote",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "i",
    "em",
    "br",
];
function getFieldFromId(id, prefilledTicketFields) {
    const isCustomField = !Number.isNaN(Number(id));
    if (isCustomField) {
        const name = `request[custom_fields][${id}]`;
        return prefilledTicketFields.ticketFields.find((field) => field.name === name);
    }
    switch (id) {
        case "anonymous_requester_email":
            return prefilledTicketFields.emailField;
        case "due_at":
            return prefilledTicketFields.dueDateField;
        case "collaborators":
            return prefilledTicketFields.ccField;
        case "organization_id":
            return prefilledTicketFields.organizationField;
        default:
            return prefilledTicketFields.ticketFields.find((field) => field.name === `request[${id}]`);
    }
}
function getPrefilledTicketFields(fields) {
    const { href } = location;
    const params = new URL(href).searchParams;
    const prefilledFields = {
        ...fields,
        ticketFields: [...fields.ticketFields],
    };
    if (href.length > MAX_URL_LENGTH)
        return fields;
    if (params.get("parent_id"))
        return fields;
    for (const [key, value] of params) {
        if (!key.startsWith(TICKET_FIELD_PREFIX))
            continue;
        const ticketFieldId = key.substring(TICKET_FIELD_PREFIX.length);
        const field = getFieldFromId(ticketFieldId, prefilledFields);
        if (!field)
            continue;
        const sanitizedValue = DOMPurify.sanitize(value, {
            ALLOWED_TAGS: ALLOWED_HTML_TAGS,
        });
        switch (field.type) {
            case "partialcreditcard":
                continue;
            case "multiselect":
                field.value = sanitizedValue
                    .split(",")
                    // filter out prefilled options that don't exist
                    .filter((value) => field.options.some((option) => option.value === value));
                break;
            case "checkbox":
                if (ALLOWED_BOOLEAN_VALUES.includes(sanitizedValue)) {
                    field.value =
                        sanitizedValue === "true"
                            ? "on"
                            : sanitizedValue === "false"
                                ? "off"
                                : "";
                }
                break;
            default:
                field.value = sanitizedValue;
        }
    }
    return prefilledFields;
}
function usePrefilledTicketFields({ ticketFields, ccField, dueDateField, emailField, organizationField, }) {
    return reactExports.useMemo(() => getPrefilledTicketFields({
        ticketFields,
        ccField,
        dueDateField,
        emailField,
        organizationField,
    }), [ticketFields, ccField, dueDateField, emailField, organizationField]);
}

const FileNameWrapper = styled.div `
  flex: 1;
`;
function FileListItem({ file, onRemove, }) {
    const { t } = useTranslation();
    const handleFileKeyDown = (e) => {
        if (e.code === "Delete" || e.code === "Backspace") {
            e.preventDefault();
            onRemove();
        }
    };
    const handleCloseKeyDown = (e) => {
        if (e.code === "Enter" ||
            e.code === "Space" ||
            e.code === "Delete" ||
            e.code === "Backspace") {
            e.preventDefault();
            onRemove();
        }
    };
    const fileName = file.status === "pending" ? file.file_name : file.value.file_name;
    const stopUploadLabel = t("new-request-form.attachments.stop-upload", "Stop upload");
    const removeFileLabel = t("new-request-form.attachments.remove-file", "Remove file");
    return (jsxRuntimeExports.jsx(FileList.Item, { children: jsxRuntimeExports.jsx(File, { type: "generic", title: fileName, onKeyDown: handleFileKeyDown, children: file.status === "pending" ? (jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx(FileNameWrapper, { children: fileName }), jsxRuntimeExports.jsx(Tooltip, { content: stopUploadLabel, children: jsxRuntimeExports.jsx(File.Close, { "aria-label": stopUploadLabel, onClick: () => {
                                onRemove();
                            }, onKeyDown: handleCloseKeyDown }) }), jsxRuntimeExports.jsx(Progress, { value: file.progress, "aria-label": t("new-request-form.attachments.uploading", "Uploading {{fileName}}", { fileName }) })] })) : (jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx(FileNameWrapper, { children: jsxRuntimeExports.jsx(Anchor, { isExternal: true, href: file.value.url, target: "_blank", children: fileName }) }), jsxRuntimeExports.jsx(Tooltip, { content: removeFileLabel, children: jsxRuntimeExports.jsx(File.Delete, { "aria-label": removeFileLabel, onClick: () => {
                                onRemove();
                            }, onKeyDown: handleCloseKeyDown }) }), jsxRuntimeExports.jsx(Progress, { value: 100, "aria-hidden": "true" })] })) }) }));
}

function useAttachedFiles(initialValue) {
    const [files, setFiles] = reactExports.useState(initialValue);
    const addPendingFile = reactExports.useCallback((id, file_name, xhr) => {
        setFiles((current) => [
            ...current,
            { status: "pending", id, file_name, progress: 0, xhr },
        ]);
    }, []);
    const setPendingFileProgress = reactExports.useCallback((id, progress) => {
        setFiles((current) => current.map((file) => file.status === "pending" && file.id === id
            ? { ...file, progress }
            : file));
    }, []);
    const removePendingFile = reactExports.useCallback((id) => {
        setFiles((current) => current.filter((file) => file.status !== "pending" || file.id !== id));
    }, []);
    const removeUploadedFile = reactExports.useCallback((id) => {
        setFiles((current) => current.filter((file) => file.status !== "uploaded" || file.value.id !== id));
    }, []);
    const setUploaded = reactExports.useCallback((pendingId, value) => {
        setFiles((current) => current.map((file) => file.status === "pending" && file.id === pendingId
            ? { status: "uploaded", value }
            : file));
    }, []);
    return {
        files,
        addPendingFile,
        setPendingFileProgress,
        removePendingFile,
        removeUploadedFile,
        setUploaded,
    };
}

async function fetchCsrfToken() {
    const response = await fetch("/api/v2/users/me.json");
    const { user: { authenticity_token }, } = await response.json();
    return authenticity_token;
}
function Attachments({ field }) {
    const { label, error, name, attachments } = field;
    const { files, addPendingFile, setPendingFileProgress, setUploaded, removePendingFile, removeUploadedFile, } = useAttachedFiles(attachments.map((value) => ({
        status: "uploaded",
        value,
    })) ?? []);
    const { addToast } = useToast();
    const { t } = useTranslation();
    const notifyError = reactExports.useCallback((fileName) => {
        addToast(({ close }) => (jsxRuntimeExports.jsxs(Notification, { type: "error", children: [jsxRuntimeExports.jsx(Title, { children: t("new-request-form.attachments.upload-error-title", "Upload error") }), t("new-request-form.attachments.upload-error-description", "There was an error uploading {{fileName}}. Try again or upload another file.", { fileName }), jsxRuntimeExports.jsx(Close, { "aria-label": t("new-request-form.close-label", "Close"), onClick: close })] })));
    }, [addToast, t]);
    const onDrop = reactExports.useCallback(async (acceptedFiles) => {
        const csrfToken = await fetchCsrfToken();
        for (const file of acceptedFiles) {
            // fetch doesn't support upload progress, so we use XMLHttpRequest
            const xhr = new XMLHttpRequest();
            const url = new URL(`${window.location.origin}/api/v2/uploads.json`);
            url.searchParams.append("filename", file.name);
            xhr.open("POST", url);
            // If the browser returns a type for the file, use it as the Content-Type header,
            // otherwise try to determine the mime type from the file extension using the mime
            // library. If we can't determine the mime type, we'll fall back to a generic
            // application/octet-stream.
            if (file.type) {
                xhr.setRequestHeader("Content-Type", file.type);
            }
            else {
                const mimeType = mime.getType(file.name);
                xhr.setRequestHeader("Content-Type", mimeType || "application/octet-stream");
            }
            xhr.setRequestHeader("X-CSRF-Token", csrfToken);
            xhr.responseType = "json";
            const pendingId = crypto.randomUUID();
            addPendingFile(pendingId, file.name, xhr);
            xhr.upload.addEventListener("progress", ({ loaded, total }) => {
                const progress = Math.round((loaded / total) * 100);
                // There is a bit of delay between the upload ending and the
                // load event firing, so we don't want to set the progress to 100
                // otherwise it is not clear that the upload is still in progress.
                if (progress <= 90) {
                    setPendingFileProgress(pendingId, progress);
                }
            });
            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const { upload: { attachment: { file_name, content_url }, token, }, } = xhr.response;
                    setUploaded(pendingId, { id: token, file_name, url: content_url });
                }
                else {
                    notifyError(file.name);
                    removePendingFile(pendingId);
                }
            });
            xhr.addEventListener("error", () => {
                notifyError(file.name);
                removePendingFile(pendingId);
            });
            xhr.send(file);
        }
    }, [
        addPendingFile,
        removePendingFile,
        setPendingFileProgress,
        setUploaded,
        notifyError,
    ]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });
    const handleRemove = async (file) => {
        if (file.status === "pending") {
            file.xhr.abort();
            removePendingFile(file.id);
        }
        else {
            const csrfToken = await fetchCsrfToken();
            const token = file.value.id;
            removeUploadedFile(file.value.id);
            await fetch(`/api/v2/uploads/${token}.json`, {
                method: "DELETE",
                headers: { "X-CSRF-Token": csrfToken },
            });
        }
    };
    return (jsxRuntimeExports.jsxs(Field, { children: [jsxRuntimeExports.jsx(Label, { children: label }), error && jsxRuntimeExports.jsx(Message, { validation: "error", children: error }), jsxRuntimeExports.jsxs(FileUpload, { ...getRootProps(), isDragging: isDragActive, children: [isDragActive ? (jsxRuntimeExports.jsx("span", { children: t("new-request-form.attachments.drop-files-label", "Drop files here") })) : (jsxRuntimeExports.jsx("span", { children: t("new-request-form.attachments.choose-file-label", "Choose a file or drag and drop here") })), jsxRuntimeExports.jsx(Input$1, { ...getInputProps() })] }), files.map((file) => (jsxRuntimeExports.jsx(FileListItem, { file: file, onRemove: () => {
                    handleRemove(file);
                } }, file.status === "pending" ? file.id : file.value.id))), files.map((file) => file.status === "uploaded" && (jsxRuntimeExports.jsx("input", { type: "hidden", name: name, value: JSON.stringify(file.value) }, file.value.id)))] }));
}

function getFieldConditions(fieldId, endUserConditions) {
    return endUserConditions.filter((condition) => {
        return condition.child_fields.some((child) => child.id === fieldId);
    });
}
function getAppliedConditions(fieldConditions, allConditions, fields) {
    return fieldConditions.filter((condition) => {
        const parentField = fields.find((field) => field.id === condition.parent_field_id);
        if (!parentField) {
            return false;
        }
        const parentFieldConditions = getFieldConditions(parentField.id, allConditions);
        // the condition is applied if the parent field value matches the condition value
        // and if the parent field has no conditions or if the parent field conditions are met
        return (parentField.value === condition.value &&
            (parentFieldConditions.length === 0 ||
                getAppliedConditions(parentFieldConditions, allConditions, fields)
                    .length > 0));
    });
}
function getVisibleFields(fields, endUserConditions) {
    if (endUserConditions.length === 0) {
        return fields;
    }
    return fields.reduce((acc, field) => {
        const fieldConditions = getFieldConditions(field.id, endUserConditions);
        if (fieldConditions.length === 0) {
            return [...acc, field];
        }
        const appliedConditions = getAppliedConditions(fieldConditions, endUserConditions, fields);
        if (appliedConditions.length > 0) {
            return [
                ...acc,
                {
                    ...field,
                    required: appliedConditions.some((condition) => condition.child_fields.some((child) => child.id == field.id && child.is_required)),
                },
            ];
        }
        return acc;
    }, []);
}

function DatePicker({ field, locale, valueFormat, onChange, }) {
    const { label, error, value, name, required, description } = field;
    const [date, setDate] = reactExports.useState(value ? new Date(value) : undefined);
    const formatDate = (value) => {
        if (value === undefined) {
            return "";
        }
        const isoString = value.toISOString();
        return valueFormat === "dateTime" ? isoString : isoString.split("T")[0];
    };
    const handleChange = (date) => {
        // Set the time to 12:00:00 as this is also the expected behavior across Support and the API
        const newDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
        setDate(newDate);
        const dateString = formatDate(newDate);
        if (dateString !== undefined) {
            onChange(dateString);
        }
    };
    const handleInputChange = (e) => {
        // Allow field to be cleared
        if (e.target.value === "") {
            setDate(undefined);
            onChange("");
        }
    };
    return (jsxRuntimeExports.jsxs(Field, { children: [jsxRuntimeExports.jsxs(Label, { children: [label, required && jsxRuntimeExports.jsx(Span, { "aria-hidden": "true", children: "*" })] }), description && (jsxRuntimeExports.jsx(Hint, { dangerouslySetInnerHTML: { __html: description } })), jsxRuntimeExports.jsx(Datepicker, { value: date, onChange: handleChange, locale: locale, children: jsxRuntimeExports.jsx(Input$1, { required: required, lang: locale, onChange: handleInputChange, validation: error ? "error" : undefined }) }), error && jsxRuntimeExports.jsx(Message, { validation: "error", children: error }), jsxRuntimeExports.jsx("input", { type: "hidden", name: name, value: formatDate(date) })] }));
}

function useTagsInputContainer({ tags, onTagsChange, inputValue, onInputValueChange, inputRef, gridRowRef, i18n, }) {
    const [selectedIndex, setSelectedIndex] = reactExports.useState(0);
    const [announcement, setAnnouncement] = reactExports.useState("");
    const gridOnChange = reactExports.useCallback((_, colIndex) => {
        setSelectedIndex(colIndex);
    }, [setSelectedIndex]);
    const { getGridProps, getGridCellProps } = useGrid({
        matrix: [tags],
        rowIndex: 0,
        colIndex: selectedIndex,
        onChange: gridOnChange,
    });
    const hasTag = (tag) => {
        return tags.includes(tag);
    };
    const addTag = (tag) => {
        onTagsChange([...tags, tag]);
        setAnnouncement(i18n.addedTag(tag));
    };
    const removeTagAt = (at) => {
        const tag = tags[at];
        onTagsChange(tags.filter((_, index) => index !== at));
        setAnnouncement(i18n.removedTag(tag));
        setSelectedIndex(0);
        /* Move focus to the first tag once a tag has been removed, after 100ms to let screen reader read the
           announcement first */
        setTimeout(() => {
            const selectedTag = gridRowRef.current?.querySelector(`[tabindex="0"]`);
            selectedTag?.focus();
        }, 100);
    };
    const handleContainerClick = (e) => {
        if (e.target === e.currentTarget) {
            inputRef.current?.focus();
        }
    };
    const handleContainerBlur = () => {
        setSelectedIndex(0);
    };
    const handleInputKeyDown = (e) => {
        const target = e.target;
        const tag = target.value;
        if (tag &&
            (e.code === "Space" ||
                e.code === "Enter" ||
                e.code === "Comma" ||
                e.code === "Tab")) {
            e.preventDefault();
            if (!hasTag(tag)) {
                addTag(tag);
            }
            onInputValueChange("");
        }
    };
    const handleInputChange = (e) => {
        const currentValue = e.target.value;
        /* On mobile browsers, the keyDown event doesn't provide the code
          of the pressed key: https://www.w3.org/TR/uievents/#determine-keydown-keyup-keyCode,
          so we need to check for spaces or commas on the change event to let the user
          adds a tag  */
        const [tag, separator] = [
            currentValue.slice(0, -1),
            currentValue.slice(-1),
        ];
        if (separator === " " || separator === ",") {
            if (tag.length > 0 && !hasTag(tag)) {
                addTag(tag);
            }
            onInputValueChange("");
        }
        else {
            onInputValueChange(currentValue);
        }
    };
    const handleInputPaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text");
        const values = new Set(data.split(/[\s,;]+/).filter((value) => !tags.includes(value)));
        onTagsChange([...tags, ...values]);
        setAnnouncement(i18n.addedTags([...values]));
    };
    const handleTagKeyDown = (index) => (e) => {
        if (e.code === "Backspace") {
            e.preventDefault();
            removeTagAt(index);
        }
    };
    const handleTagCloseClick = (index) => () => {
        removeTagAt(index);
    };
    const getContainerProps = () => ({
        onClick: handleContainerClick,
        onBlur: handleContainerBlur,
        tabIndex: -1,
    });
    const getGridRowProps = () => ({
        role: "row",
    });
    const getTagCloseProps = (index) => ({
        onClick: handleTagCloseClick(index),
    });
    const getInputProps = () => ({
        value: inputValue,
        onChange: handleInputChange,
        onKeyDown: handleInputKeyDown,
        onPaste: handleInputPaste,
    });
    const getAnnouncementProps = () => ({
        "aria-live": "polite",
        "aria-relevant": "text",
    });
    return {
        getContainerProps,
        getGridProps,
        getGridRowProps,
        getGridCellProps: (index) => getGridCellProps({
            rowIndex: 0,
            colIndex: index,
            onKeyDown: handleTagKeyDown(index),
        }),
        getTagCloseProps,
        getInputProps,
        announcement,
        getAnnouncementProps,
    };
}

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const Container$1 = styled(FauxInput) `
  padding: ${(props) => `${props.theme.space.xxs} ${props.theme.space.sm}`};

  // Removes white spaces for inline elements
  font-size: 0;

  // Same as height of Tag size="large" + base space (4px)
  // to give some vertical space between tags
  --line-height: ${(props) => props.theme.space.base * 8 + props.theme.space.base}px;
  line-height: var(--line-height);
`;
const GridCell = styled.span `
  display: inline-block;
  margin-right: ${(props) => props.theme.space.sm};
`;
const StyledTag = styled(Tag) `
  ${(props) => focusStyles({
    theme: props.theme,
    shadowWidth: "sm",
    selector: "&:focus",
})}
`;
const InputWrapper = styled.div `
  display: inline-block;
  position: relative;
`;
const InputMirror = styled(FauxInput) `
  display: inline-block;
  min-width: 200px;
  opacity: 0;
  user-select: none;
  height: var(--line-height);
  line-height: var(--line-height);
`;
const StyledInput = styled(Input$1) `
  position: absolute;
  top: 0;
  left: 0;
  height: var(--line-height);
  line-height: var(--line-height);
`;
function CcField({ field }) {
    const { label, value, name, error, description } = field;
    const { t } = useTranslation();
    const initialValue = value
        ? value.split(",").map((email) => email.trim())
        : [];
    const [tags, setTags] = reactExports.useState(initialValue);
    const [inputValue, setInputValue] = reactExports.useState("");
    const inputRef = reactExports.useRef(null);
    const gridRowRef = reactExports.useRef(null);
    const { getContainerProps, getGridProps, getGridRowProps, getGridCellProps, getTagCloseProps, getInputProps, getAnnouncementProps, announcement, } = useTagsInputContainer({
        tags,
        onTagsChange: setTags,
        inputValue,
        onInputValueChange: setInputValue,
        inputRef,
        gridRowRef,
        i18n: {
            addedTag: (email) => t("new-request-form.cc-field.email-added", "{{email}} has been added", {
                email,
            }),
            removedTag: (email) => t("new-request-form.cc-field.email-removed", "{{email}} has been removed", { email }),
            addedTags: (emails) => t("new-request-form.cc-field.emails-added", "{{emails}} have been added", { emails }),
        },
    });
    const renderTag = (index, isValid, email) => (jsxRuntimeExports.jsxs(StyledTag, { size: "large", "aria-label": t("new-request-form.cc-field.email-label", "{{email}} - Press Backspace to remove", { email }), hue: isValid ? undefined : "red", children: [!isValid && (jsxRuntimeExports.jsx(Tag.Avatar, { children: jsxRuntimeExports.jsx(SvgAlertWarningStroke, {}) })), jsxRuntimeExports.jsx("span", { children: email }), jsxRuntimeExports.jsx(Tag.Close, { ...getTagCloseProps(index) })] }));
    return (jsxRuntimeExports.jsxs(Field, { children: [jsxRuntimeExports.jsx(Label, { children: label }), description && jsxRuntimeExports.jsx(Hint, { children: description }), jsxRuntimeExports.jsxs(Container$1, { ...getContainerProps(), children: [tags.length > 0 && (jsxRuntimeExports.jsx("span", { ...getGridProps({
                            "aria-label": t("new-request-form.cc-field.container-label", "Selected CC emails"),
                        }), children: jsxRuntimeExports.jsx("span", { ref: gridRowRef, ...getGridRowProps(), children: tags.map((email, index) => {
                                const isValid = EMAIL_REGEX.test(email);
                                return isValid ? (jsxRuntimeExports.jsx(GridCell, { ...getGridCellProps(index), children: renderTag(index, isValid, email) }, index)) : (jsxRuntimeExports.jsx(Tooltip, { content: t("new-request-form.cc-field.invalid-email", "Invalid email address"), children: jsxRuntimeExports.jsx(GridCell, { ...getGridCellProps(index), children: renderTag(index, isValid, email) }) }, index));
                            }) }) })), jsxRuntimeExports.jsxs(InputWrapper, { children: [jsxRuntimeExports.jsx(InputMirror, { isBare: true, "aria-hidden": "true", tabIndex: -1, children: inputValue }), jsxRuntimeExports.jsx(StyledInput, { ref: inputRef, isBare: true, ...getInputProps() })] })] }), error && jsxRuntimeExports.jsx(Message, { validation: "error", children: error }), tags.map((email) => (jsxRuntimeExports.jsx("input", { type: "hidden", name: name, value: email }, email))), jsxRuntimeExports.jsx(Span, { hidden: true, ...getAnnouncementProps(), children: announcement })] }));
}

/**
 * When there is an error in the credit card field, the backend returns a redacted value with the last 4 digits prefixed with some Xs.
 * This function removes the Xs from the value and returns the last 4 digits of the credit card
 *
 * @param value The value returned by the backend with last 4 digits prefixed with some Xs
 * @returns The last 4 digits of the credit card
 */
function getLastDigits(value) {
    return value ? value.replaceAll("X", "") : "";
}
const DigitsHintSpan = styled(Span) `
  margin-left: ${(props) => props.theme.space.xxs};
  font-weight: ${(props) => props.theme.fontWeights.medium};
`;
function CreditCard({ field, onChange }) {
    const { t } = useTranslation();
    const { label, error, value, name, required, description } = field;
    const digits = getLastDigits(value);
    return (jsxRuntimeExports.jsxs(Field, { children: [jsxRuntimeExports.jsxs(Label, { children: [label, required && jsxRuntimeExports.jsx(Span, { "aria-hidden": "true", children: "*" }), jsxRuntimeExports.jsx(DigitsHintSpan, { children: t("new-request-form.credit-card-digits-hint", "(Last 4 digits)") })] }), description && (jsxRuntimeExports.jsx(Hint, { dangerouslySetInnerHTML: { __html: description } })), jsxRuntimeExports.jsx(MediaInput, { start: jsxRuntimeExports.jsx(SvgCreditCardStroke, {}), name: name, type: "text", value: digits, onChange: (e) => onChange(e.target.value), validation: error ? "error" : undefined, required: required, maxLength: 4, placeholder: "XXXX" }), error && jsxRuntimeExports.jsx(Message, { validation: "error", children: error })] }));
}

function Tagger({ field, onChange }) {
    const { label, options, error, value, name, required, description } = field;
    const { currentGroup, isGroupIdentifier, setCurrentGroupByIdentifier } = useNestedOptions({
        options,
        hasEmptyOption: true,
    });
    const selectionValue = value ?? "";
    const [isExpanded, setIsExpanded] = reactExports.useState(false);
    const wrapperRef = reactExports.useRef(null);
    reactExports.useEffect(() => {
        if (wrapperRef.current && required) {
            const combobox = wrapperRef.current.querySelector("[role=combobox]");
            combobox?.setAttribute("aria-required", "true");
        }
    }, [wrapperRef, required]);
    const handleChange = (changes) => {
        if (typeof changes.selectionValue === "string" &&
            isGroupIdentifier(changes.selectionValue)) {
            setCurrentGroupByIdentifier(changes.selectionValue);
            return;
        }
        if (typeof changes.selectionValue === "string") {
            onChange(changes.selectionValue);
        }
        if (changes.isExpanded !== undefined) {
            setIsExpanded(changes.isExpanded);
        }
    };
    return (jsxRuntimeExports.jsxs(Field$1, { children: [jsxRuntimeExports.jsxs(Label$1, { children: [label, required && jsxRuntimeExports.jsx(Span, { "aria-hidden": "true", children: "*" })] }), description && (jsxRuntimeExports.jsx(Hint$1, { dangerouslySetInnerHTML: { __html: description } })), jsxRuntimeExports.jsxs(Combobox, { ref: wrapperRef, inputProps: { required, name }, isEditable: false, validation: error ? "error" : undefined, onChange: handleChange, selectionValue: selectionValue, inputValue: selectionValue, renderValue: ({ selection }) => selection?.label ?? jsxRuntimeExports.jsx(EmptyValueOption, {}), isExpanded: isExpanded, children: [currentGroup.type === "SubGroup" && (jsxRuntimeExports.jsx(Option, { ...currentGroup.backOption })), currentGroup.type === "SubGroup" ? (jsxRuntimeExports.jsx(OptGroup, { "aria-label": currentGroup.name, children: currentGroup.options.map((option) => (jsxRuntimeExports.jsx(Option, { ...option, children: option.menuLabel ?? option.label }, option.value))) })) : (currentGroup.options.map((option) => option.value === "" ? (jsxRuntimeExports.jsx(Option, { ...option, children: jsxRuntimeExports.jsx(EmptyValueOption, {}) }, option.value)) : (jsxRuntimeExports.jsx(Option, { ...option }, option.value))))] }), error && jsxRuntimeExports.jsx(Message$1, { validation: "error", children: error })] }));
}

function useDebounce(value, delayMs) {
    const [debouncedValue, setDebouncedValue] = reactExports.useState(value);
    reactExports.useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delayMs);
        return () => {
            clearTimeout(timer);
        };
    }, [value, delayMs]);
    return debouncedValue;
}

const slideIn = We `
  from {
    grid-template-rows: 0fr;
  }
  to {
    grid-template-rows: 1fr;
  }
`;
const Container = styled.div `
  display: grid;
  animation: ${slideIn} 200ms forwards;
`;
const InnerContainer = styled.div `
  overflow: hidden;
`;
const UnstyledList = styled.ul `
  list-style: none;
  padding: 0;
  margin: 0;
`;
const ListItem = styled.li `
  margin: ${(props) => props.theme.space.sm} 0;
`;
function hasMinLength(value) {
    const firstLetter = value.charCodeAt(0);
    /*
     * Special case considering CJK characters. Since ideographs represent
     * whole words, we want to start searching when just two has been typed.
     *
     * Unicode range reference:
     * http://www.unicode.org/versions/Unicode5.0.0/ch12.pdf#G16616
     */
    if (firstLetter >= 0x4e00 && firstLetter <= 0x2fa1f) {
        return value.length >= 2;
    }
    else {
        return value.length >= 3;
    }
}
function SuggestedArticles({ query: inputQuery, locale, }) {
    const debouncedQuery = useDebounce(inputQuery, 500);
    const [articles, setArticles] = reactExports.useState([]);
    const requestsCache = reactExports.useRef({});
    const { t } = useTranslation();
    reactExports.useEffect(() => {
        const query = debouncedQuery?.trim().toLocaleLowerCase();
        if (!query || !hasMinLength(query)) {
            setArticles([]);
            return;
        }
        const requestUrl = new URL(`${window.location.origin}/api/v2/help_center/deflection/suggestions.json`);
        requestUrl.searchParams.append("locale", locale);
        requestUrl.searchParams.append("query", query);
        const cachedResponse = requestsCache.current[requestUrl.toString()];
        if (cachedResponse) {
            setArticles(cachedResponse);
            return;
        }
        fetch(requestUrl)
            .then((response) => response.json())
            .then(({ results }) => {
            requestsCache.current[requestUrl.toString()] = results;
            setArticles(results);
        });
    }, [debouncedQuery, locale]);
    return articles.length > 0 ? (jsxRuntimeExports.jsx(Container, { "data-test-id": "suggested-articles", children: jsxRuntimeExports.jsxs(InnerContainer, { children: [jsxRuntimeExports.jsx("h2", { children: t("new-request-form.suggested-articles", "Suggested articles") }), jsxRuntimeExports.jsx(UnstyledList, { children: articles.map((article) => (jsxRuntimeExports.jsx(ListItem, { children: jsxRuntimeExports.jsx(Anchor, { href: article.html_url, children: article.name }) }, article.html_url))) })] }) })) : null;
}

const H3 = styled.h3 `
  font-size: ${(props) => props.theme.fontSizes.md};
  font-weight: ${(props) => props.theme.fontWeights.bold};
`;
const StyledHeader = styled(Header) `
  color: ${(props) => getColorV8("successHue", 700, props.theme)};
`;
const StyledSuccessIcon = styled(SvgCheckCircleStroke) `
  position: absolute;
  top: ${(props) => props.theme.space.base * 5.5}px;
  inset-inline-start: ${(props) => `${props.theme.space.base * 4}px`};
`;
const ArticleLink = styled(Anchor) `
  display: inline-block;
  margin-top: ${(props) => props.theme.space.sm};
`;
function AnswerBotModal({ authToken, interactionAccessToken, articles, requestId, hasRequestManagement, isSignedIn, helpCenterPath, requestsPath, requestPath, }) {
    const [expandedIndex, setExpandedIndex] = reactExports.useState(0);
    const modalContainer = useModalContainer();
    const { t } = useTranslation();
    const getExpandedArticleId = () => {
        return String(articles[expandedIndex]?.article_id);
    };
    const getUnsolvedRedirectUrl = () => {
        if (!isSignedIn) {
            const searchParams = new URLSearchParams();
            searchParams.set("return_to", requestsPath);
            return `${helpCenterPath}?${searchParams.toString()}`;
        }
        else if (hasRequestManagement) {
            return requestPath;
        }
        else {
            return helpCenterPath;
        }
    };
    const addUnsolvedNotificationAndRedirect = () => {
        addFlashNotification({
            type: "success",
            message: t("new-request-form.answer-bot-modal.request-submitted", "Your request was successfully submitted"),
        });
        window.location.assign(getUnsolvedRedirectUrl());
    };
    const solveRequest = async () => {
        const response = await fetch("/api/v2/answer_bot/resolution", {
            method: "POST",
            body: JSON.stringify({
                article_id: getExpandedArticleId(),
                interaction_access_token: interactionAccessToken,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.ok) {
            addFlashNotification({
                type: "success",
                message: t("new-request-form.answer-bot-modal.request-closed", "Nice. Your request has been closed."),
            });
        }
        else {
            addFlashNotification({
                type: "error",
                message: t("new-request-form.answer-bot-modal.solve-error", "There was an error closing your request"),
            });
        }
        window.location.href = helpCenterPath;
    };
    const markArticleAsIrrelevant = async () => {
        await fetch("/api/v2/answer_bot/rejection", {
            method: "POST",
            body: JSON.stringify({
                article_id: getExpandedArticleId(),
                interaction_access_token: interactionAccessToken,
                reason_id: 0,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        addUnsolvedNotificationAndRedirect();
    };
    return (jsxRuntimeExports.jsxs(Modal, { appendToNode: modalContainer, onClose: () => {
            addUnsolvedNotificationAndRedirect();
        }, children: [jsxRuntimeExports.jsxs(StyledHeader, { tag: "h2", children: [jsxRuntimeExports.jsx(StyledSuccessIcon, {}), t("new-request-form.answer-bot-modal.request-submitted", "Your request was successfully submitted")] }), jsxRuntimeExports.jsxs(Body, { children: [jsxRuntimeExports.jsx(H3, { children: t("new-request-form.answer-bot-modal.title", "While you wait, do any of these articles answer your question?") }), jsxRuntimeExports.jsx("p", { children: t("new-request-form.answer-bot-modal.footer-content", "If it does, we can close your recent request {{requestId}}", {
                            requestId: `\u202D#${requestId}\u202C`,
                        }) }), jsxRuntimeExports.jsx(Accordion, { level: 4, expandedSections: [expandedIndex], onChange: (index) => {
                            setExpandedIndex(index);
                        }, children: articles.map(({ article_id, html_url, snippet, title }) => (jsxRuntimeExports.jsxs(Accordion.Section, { children: [jsxRuntimeExports.jsx(Accordion.Header, { children: jsxRuntimeExports.jsx(Accordion.Label, { children: title }) }), jsxRuntimeExports.jsxs(Accordion.Panel, { children: [jsxRuntimeExports.jsx(Paragraph, { dangerouslySetInnerHTML: { __html: snippet } }), jsxRuntimeExports.jsx(ArticleLink, { isExternal: true, href: `${html_url}?auth_token=${authToken}`, target: "_blank", children: t("new-request-form.answer-bot-modal.view-article", "View article") })] })] }, article_id))) })] }), jsxRuntimeExports.jsxs(Footer$1, { children: [jsxRuntimeExports.jsx(FooterItem, { children: jsxRuntimeExports.jsx(Button, { onClick: () => {
                                markArticleAsIrrelevant();
                            }, children: t("new-request-form.answer-bot-modal.mark-irrelevant", "No, I need help") }) }), jsxRuntimeExports.jsx(FooterItem, { children: jsxRuntimeExports.jsx(Button, { isPrimary: true, onClick: () => {
                                solveRequest();
                            }, children: t("new-request-form.answer-bot-modal.solve-request", "Yes, close my request") }) })] }), jsxRuntimeExports.jsx(Close$1, { "aria-label": t("new-request-form.close-label", "Close") })] }));
}

const StyledParagraph = styled(Paragraph) `
  margin: ${(props) => props.theme.space.md} 0;
`;
const Form = styled.form `
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.md};
`;
const Footer = styled.div `
  margin-top: ${(props) => props.theme.space.md};
`;
function NewRequestForm({ requestForm, wysiwyg, newRequestPath, parentId, parentIdPath, locale, baseLocale, hasAtMentions, userRole, brandId, answerBotModal, }) {
    const { ticket_fields, action, http_method, accept_charset, errors, parent_id_field, ticket_form_field, email_field, cc_field, organization_field, due_date_field, end_user_conditions, attachments_field, inline_attachments_fields, description_mimetype_field, } = requestForm;
    const { answerBot } = answerBotModal;
    const { ticketFields: prefilledTicketFields, emailField, ccField, organizationField: prefilledOrganizationField, dueDateField: prefilledDueDateField, } = usePrefilledTicketFields({
        ticketFields: ticket_fields,
        emailField: email_field,
        ccField: cc_field,
        organizationField: organization_field,
        dueDateField: due_date_field,
    });
    const [ticketFields, setTicketFields] = reactExports.useState(prefilledTicketFields);
    const [organizationField, setOrganizationField] = reactExports.useState(prefilledOrganizationField);
    const [dueDateField, setDueDateField] = reactExports.useState(prefilledDueDateField);
    const visibleFields = getVisibleFields(ticketFields, end_user_conditions);
    const { formRefCallback, handleSubmit } = useFormSubmit(ticketFields);
    const { t } = useTranslation();
    function handleChange(field, value) {
        setTicketFields(ticketFields.map((ticketField) => ticketField.name === field.name
            ? { ...ticketField, value }
            : ticketField));
    }
    function handleOrganizationChange(value) {
        if (organizationField === null) {
            return;
        }
        setOrganizationField({ ...organizationField, value });
    }
    function handleDueDateChange(value) {
        if (dueDateField === null) {
            return;
        }
        setDueDateField({ ...dueDateField, value });
    }
    return (jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [parentId && (jsxRuntimeExports.jsx(StyledParagraph, { children: jsxRuntimeExports.jsx(Anchor, { href: parentIdPath, children: t("new-request-form.parent-request-link", "Follow-up to request {{parentId}}", {
                        parentId: `\u202D#${parentId}\u202C`,
                    }) }) })), jsxRuntimeExports.jsx(StyledParagraph, { "aria-hidden": "true", children: t("new-request-form.required-fields-info", "Fields marked with an asterisk (*) are required.") }), jsxRuntimeExports.jsxs(Form, { ref: formRefCallback, action: action, method: http_method, acceptCharset: accept_charset, noValidate: true, onSubmit: handleSubmit, children: [errors && jsxRuntimeExports.jsx(Alert, { type: "error", children: errors }), parent_id_field && jsxRuntimeExports.jsx(ParentTicketField, { field: parent_id_field }), ticket_form_field.options.length > 0 && (jsxRuntimeExports.jsx(TicketFormField, { field: ticket_form_field, newRequestPath: newRequestPath })), emailField && jsxRuntimeExports.jsx(Input, { field: emailField }, emailField.name), ccField && jsxRuntimeExports.jsx(CcField, { field: ccField }), organizationField && (jsxRuntimeExports.jsx(DropDown, { field: organizationField, onChange: (value) => {
                            handleOrganizationChange(value);
                        } }, organizationField.name)), visibleFields.map((field) => {
                        switch (field.type) {
                            case "subject":
                                return (jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx(Input, { field: field, onChange: (value) => handleChange(field, value) }, field.name), jsxRuntimeExports.jsx(SuggestedArticles, { query: field.value, locale: locale })] }));
                            case "text":
                            case "integer":
                            case "decimal":
                            case "regexp":
                                return (jsxRuntimeExports.jsx(Input, { field: field, onChange: (value) => handleChange(field, value) }, field.name));
                            case "partialcreditcard":
                                return (jsxRuntimeExports.jsx(CreditCard, { field: field, onChange: (value) => handleChange(field, value) }));
                            case "description":
                                return (jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx(TextArea, { field: field, hasWysiwyg: wysiwyg, baseLocale: baseLocale, hasAtMentions: hasAtMentions, userRole: userRole, brandId: brandId, onChange: (value) => handleChange(field, value) }, field.name), jsxRuntimeExports.jsx("input", { type: "hidden", name: description_mimetype_field.name, value: wysiwyg ? "text/html" : "text/plain" })] }));
                            case "textarea":
                                return (jsxRuntimeExports.jsx(TextArea, { field: field, hasWysiwyg: false, baseLocale: baseLocale, hasAtMentions: hasAtMentions, userRole: userRole, brandId: brandId, onChange: (value) => handleChange(field, value) }, field.name));
                            case "priority":
                            case "basic_priority":
                            case "tickettype":
                                return (jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx(DropDown, { field: field, onChange: (value) => handleChange(field, value) }, field.name), field.value === "task" && (jsxRuntimeExports.jsx(DatePicker, { field: dueDateField, locale: baseLocale, valueFormat: "dateTime", onChange: (value) => {
                                                handleDueDateChange(value);
                                            } }))] }));
                            case "checkbox":
                                return (jsxRuntimeExports.jsx(Checkbox, { field: field, onChange: (value) => handleChange(field, value) }));
                            case "date":
                                return (jsxRuntimeExports.jsx(DatePicker, { field: field, locale: baseLocale, valueFormat: "date", onChange: (value) => handleChange(field, value) }));
                            case "multiselect":
                                return jsxRuntimeExports.jsx(MultiSelect, { field: field });
                            case "tagger":
                                return (jsxRuntimeExports.jsx(Tagger, { field: field, onChange: (value) => handleChange(field, value) }, field.name));
                            default:
                                return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {});
                        }
                    }), attachments_field && jsxRuntimeExports.jsx(Attachments, { field: attachments_field }), inline_attachments_fields.map(({ type, name, value }, index) => (jsxRuntimeExports.jsx("input", { type: type, name: name, value: value }, index))), jsxRuntimeExports.jsx(Footer, { children: (ticket_form_field.options.length === 0 ||
                            ticket_form_field.value) && (jsxRuntimeExports.jsx(Button, { isPrimary: true, type: "submit", children: t("new-request-form.submit", "Submit") })) })] }), answerBot.auth_token &&
                answerBot.interaction_access_token &&
                answerBot.articles.length > 0 &&
                answerBot.request_id && (jsxRuntimeExports.jsx(AnswerBotModal, { authToken: answerBot.auth_token, interactionAccessToken: answerBot.interaction_access_token, articles: answerBot.articles, requestId: answerBot.request_id, ...answerBotModal }))] }));
}

function __variableDynamicImportRuntime0__(path) {
  switch (path) {
    case './translations/locales/af.json': return import('af');
    case './translations/locales/ar-x-pseudo.json': return import('ar-x-pseudo');
    case './translations/locales/ar.json': return import('ar');
    case './translations/locales/az.json': return import('az');
    case './translations/locales/be.json': return import('be');
    case './translations/locales/bg.json': return import('bg');
    case './translations/locales/bn.json': return import('bn');
    case './translations/locales/bs.json': return import('bs');
    case './translations/locales/ca.json': return import('ca');
    case './translations/locales/cs.json': return import('cs');
    case './translations/locales/cy.json': return import('cy');
    case './translations/locales/da.json': return import('da');
    case './translations/locales/de-x-informal.json': return import('de-x-informal');
    case './translations/locales/de.json': return import('de');
    case './translations/locales/el.json': return import('el');
    case './translations/locales/en-001.json': return import('en-001');
    case './translations/locales/en-150.json': return import('en-150');
    case './translations/locales/en-au.json': return import('en-au');
    case './translations/locales/en-ca.json': return import('new-request-form-translations').then(function (n) { return n.e; });
    case './translations/locales/en-gb.json': return import('new-request-form-translations').then(function (n) { return n.a; });
    case './translations/locales/en-my.json': return import('en-my');
    case './translations/locales/en-ph.json': return import('en-ph');
    case './translations/locales/en-se.json': return import('en-se');
    case './translations/locales/en-us.json': return import('new-request-form-translations').then(function (n) { return n.b; });
    case './translations/locales/en-x-dev.json': return import('en-x-dev');
    case './translations/locales/en-x-keys.json': return import('en-x-keys');
    case './translations/locales/en-x-obsolete.json': return import('en-x-obsolete');
    case './translations/locales/en-x-pseudo.json': return import('en-x-pseudo');
    case './translations/locales/en-x-test.json': return import('en-x-test');
    case './translations/locales/es-419.json': return import('es-419');
    case './translations/locales/es-es.json': return import('es-es');
    case './translations/locales/es.json': return import('es');
    case './translations/locales/et.json': return import('et');
    case './translations/locales/eu.json': return import('eu');
    case './translations/locales/fa-af.json': return import('fa-af');
    case './translations/locales/fa.json': return import('fa');
    case './translations/locales/fi.json': return import('fi');
    case './translations/locales/fil.json': return import('fil');
    case './translations/locales/fo.json': return import('fo');
    case './translations/locales/fr-ca.json': return import('fr-ca');
    case './translations/locales/fr.json': return import('fr');
    case './translations/locales/ga.json': return import('ga');
    case './translations/locales/he.json': return import('he');
    case './translations/locales/hi.json': return import('hi');
    case './translations/locales/hr.json': return import('hr');
    case './translations/locales/hu.json': return import('hu');
    case './translations/locales/hy.json': return import('hy');
    case './translations/locales/id.json': return import('id');
    case './translations/locales/is.json': return import('is');
    case './translations/locales/it-ch.json': return import('it-ch');
    case './translations/locales/it.json': return import('it');
    case './translations/locales/ja.json': return import('ja');
    case './translations/locales/ka.json': return import('ka');
    case './translations/locales/kk.json': return import('kk');
    case './translations/locales/kl-dk.json': return import('kl-dk');
    case './translations/locales/ko.json': return import('ko');
    case './translations/locales/ku.json': return import('ku');
    case './translations/locales/lt.json': return import('lt');
    case './translations/locales/lv.json': return import('lv');
    case './translations/locales/mk.json': return import('mk');
    case './translations/locales/mn.json': return import('mn');
    case './translations/locales/ms.json': return import('ms');
    case './translations/locales/mt.json': return import('mt');
    case './translations/locales/my.json': return import('my');
    case './translations/locales/nl-be.json': return import('nl-be');
    case './translations/locales/nl.json': return import('nl');
    case './translations/locales/no.json': return import('no');
    case './translations/locales/pl.json': return import('pl');
    case './translations/locales/pt-br.json': return import('pt-br');
    case './translations/locales/pt.json': return import('pt');
    case './translations/locales/ro.json': return import('ro');
    case './translations/locales/ru.json': return import('ru');
    case './translations/locales/sk.json': return import('sk');
    case './translations/locales/sl.json': return import('sl');
    case './translations/locales/sq.json': return import('sq');
    case './translations/locales/sr-me.json': return import('sr-me');
    case './translations/locales/sr.json': return import('sr');
    case './translations/locales/sv.json': return import('sv');
    case './translations/locales/th.json': return import('th');
    case './translations/locales/tr.json': return import('tr');
    case './translations/locales/uk.json': return import('uk');
    case './translations/locales/ur.json': return import('ur');
    case './translations/locales/uz.json': return import('uz');
    case './translations/locales/vi.json': return import('vi');
    case './translations/locales/zh-cn.json': return import('zh-cn');
    case './translations/locales/zh-tw.json': return import('zh-tw');
    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic import: " + path))
      );
    })
   }
 }
async function renderNewRequestForm(settings, props, container) {
    const { baseLocale } = props;
    initI18next(baseLocale);
    await loadTranslations(baseLocale, () => __variableDynamicImportRuntime0__(`./translations/locales/${baseLocale}.json`));
    reactDomExports.render(jsxRuntimeExports.jsx(ThemeProviders, { theme: createTheme(settings), children: jsxRuntimeExports.jsx(NewRequestForm, { ...props }) }), container);
}

export { renderNewRequestForm };
