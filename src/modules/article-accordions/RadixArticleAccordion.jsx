// eslint-disable-next-line no-unused-vars
import * as React from "react"; // Required for JSX runtime
import * as Accordion from "@radix-ui/react-accordion";

/**
 * RadixArticleAccordion - Modern accordion component using Radix UI
 * Replaces vanilla JS accordion implementation with better accessibility and smoother animations
 * Uses Radix UI recommended CSS class names for proper styling
 */
// eslint-disable-next-line react/prop-types
export const RadixArticleAccordion = ({ sections = [] }) => {
  if (sections.length === 0) {
    return null;
  }

  const handleValueChange = (value) => {
    if (value) {
      const sectionIndex = value.replace("section-", "");
      const sectionTitle = sections[parseInt(sectionIndex)]?.title || "Unknown";
      console.log(
        `[Radix Accordion] ✅ OPENING accordion: "${sectionTitle}" (${value})`
      );
    } else {
      console.log("[Radix Accordion] ❌ CLOSING accordion");
    }
  };

  return (
    <Accordion.Root
      type="single"
      collapsible
      className="AccordionRoot"
      onValueChange={handleValueChange}
    >
      {sections.map((section, index) => (
        <Accordion.Item
          key={section.id || index}
          value={`section-${index}`}
          className="AccordionItem"
        >
          <Accordion.Header className="AccordionHeader">
            <Accordion.Trigger className="AccordionTrigger">
              <span className="AccordionTitle">{section.title}</span>
              <span className="AccordionChevron" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content className="AccordionContent">
            <div
              className="AccordionContentText"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
};

/**
 * Extract accordion sections from existing DOM
 * This allows us to transform Zendesk-generated HTML into React components
 */
export function extractAccordionSections() {
  const accordionElements = document.querySelectorAll(
    ".section.accordion.sub-topic"
  );

  if (!accordionElements.length) {
    return [];
  }

  const sections = [];

  accordionElements.forEach((accordion, index) => {
    const panelHeading = accordion.querySelector(".panel-heading");
    const panelBody = accordion.querySelector(".panel-body");
    const titleElement = accordion.querySelector(".title");

    if (!panelHeading || !panelBody || !titleElement) {
      return;
    }

    // Extract the title text
    const title = titleElement.textContent.trim();

    // Extract the content HTML
    const content = panelBody.innerHTML;

    // Store reference to original element for hiding
    accordion.setAttribute("data-radix-processed", "true");

    sections.push({
      id: panelBody.id || `accordion-section-${index}`,
      title,
      content,
      originalElement: accordion,
    });
  });

  return sections;
}
