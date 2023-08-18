function getCenterLeaf() {
    const targetContainerEl = document.getElementsByClassName('workspace-split mod-vertical mod-root')[0].getElementsByClassName("workspace-leaf")[0];
  
    let targetLeaf = null;
  
    app.workspace.iterateAllLeaves(leaf => {
        if (leaf.containerEl === targetContainerEl) {
            targetLeaf = leaf;
            return false;
        }
    });
  
    return targetLeaf;
  }
  
function todaysDate() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0') // Add leading zeros if needed
    const month = months[today.getMonth()]
    const year = String(today.getFullYear()).slice(-2) // Get the last two digits of the year

    return `${day} ${month} ${year}`
}

async function getNoteFile(filepath, templateFilepath=null) {
    let noteFile = app.vault.getAbstractFileByPath(filepath);
    
    if (noteFile === null) {
        let templateContents = (templateFilepath === null) ?  "" : await app.vault.read(app.vault.getAbstractFileByPath(templateFilepath))
        await app.vault.create(filepath, templateContents);  
        return app.vault.getAbstractFileByPath(filepath);
    } 
    return noteFile
}

function setActiveTab(desiredIndex) {
  // Grab the array of tabs from the active tab group.
  const tabs = app.workspace.activeTabGroup.children;
  const tabHeaders = app.workspace.activeLeaf.containerEl.parentElement.parentElement.getElementsByClassName('workspace-tab-header-container-inner')[0].children

  // Set all tabs to inactive.
  for (let tab of tabs) {
      tab.containerEl.className = 'workspace-leaf';
      tab.containerEl.style.display = 'none';
  }

  for (let tabHeader of tabHeaders) {
    tabHeader.className = 'workspace-tab-header'
  }

  // Set the desired tab to active.
  tabs[desiredIndex].containerEl.className = 'workspace-leaf mod-active';
  tabs[desiredIndex].containerEl.style.removeProperty('display');
  tabHeaders[desiredIndex].className = 'workspace-tab-header is-active mod-active'
}

async function addToNote(notePath, addendem, separator="\n") {
    notePath = notePath + (notePath.endsWith(".md") ? "" : ".md")
    let noteFile = app.vault.getAbstractFileByPath(notePath)
    
    if (!noteFile) {
        console.error('Note not found!');
        return;
    }
    
    let currentContent = await app.vault.read(noteFile);
    let newContent = currentContent + separator + addendem
    
    await app.vault.modify(noteFile, newContent);
}

function putCursorAtEndAndScroll() {
    app.workspace.activeLeaf.view.sourceMode.cmEditor.setCursor({line: app.workspace.activeLeaf.view.sourceMode.cmEditor.lineCount(), ch: 0})
    app.workspace.activeLeaf.view.sourceMode.cmEditor.scrollTo(0, app.workspace.activeLeaf.containerEl.getElementsByClassName('cm-content')[0].scrollHeight)
}

app.workspace.setActiveLeaf(getCenterLeaf())

let activeTabFiles = app.workspace.activeTabGroup.children.map(tab => tab.view.getState().file)
// console.log('activeTabFiles', activeTabFiles)
let dailyNoteFilepath = "001 Personal/Periodic/Daily/" + todaysDate() + ".md"
// console.log('dailyNoteFilepath', dailyNoteFilepath)
let dailyNoteTemplateFilepath = "008 Obsidian/Periodic/Daily Note Template.md"
let dailyNoteFile = await getNoteFile(dailyNoteFilepath, dailyNoteTemplateFilepath)
// console.log('dailyNoteFile', dailyNoteFile)

console.log(app.workspace.activeLeaf.view.sourceMode)
let dailyNoteTabIndex = activeTabFiles.indexOf(dailyNoteFilepath)
// console.log('dailyNoteTabIndex', dailyNoteTabIndex)
if (dailyNoteTabIndex === -1) {
    app.workspace.getLeaf("tab").openFile(dailyNoteFile)
} else {
    setActiveTab(dailyNoteTabIndex)
}

console.log(app.workspace.activeLeaf.view.sourceMode)
setTimeout(3500, ()=>{})
console.log(app.workspace.activeLeaf.view.sourceMode)

await addToNote(dailyNoteFilepath, "")
console.log(app.workspace.activeLeaf.view.sourceMode)

putCursorAtEndAndScroll()