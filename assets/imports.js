const links = document.querySelectorAll('link[rel="import"]');

// Import and add each page to the DOM
Array.prototype.forEach.call(links, (link) => {
  let template = link.import.querySelector(".task-template");
  let clone = document.importNode(template.content, true);
  if (link.href.match("settings.html")) {
    document.querySelector("body").appendChild(clone);
  } else {
    const elementId = clone.children[0].dataset.section;
    document.querySelector(`#${elementId}-section`).appendChild(clone);
  }
});
