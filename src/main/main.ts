import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { WorkflowDatabase } from '../core/database'

let mainWindow: BrowserWindow | null = null
let db: WorkflowDatabase
const isDevelopment = process.env.NODE_ENV === 'development'

function getPreloadPath(appBasePath: string) {
  return path.join(appBasePath, 'dist', 'preload', 'preload.js')
}

function getRendererPath(appBasePath: string) {
  return path.join(appBasePath, 'dist', 'renderer', 'index.html')
}

function createWindow() {
  const appBasePath = app.getAppPath()

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: getPreloadPath(appBasePath),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    show: false, // Show when ready
    backgroundColor: '#1a1a1a'
  })

  // Load the app
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(getRendererPath(appBasePath))
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(async () => {
  // Initialize database
  const userDataPath = app.getPath('userData')
  db = new WorkflowDatabase(path.join(userDataPath, 'workflows.db'))
  
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  db?.close()
})

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-workflows', async () => {
  try {
    return db.getAllWorkflows()
  } catch (error) {
    console.error('Error getting workflows:', error)
    throw error
  }
})

ipcMain.handle('create-workflow', async (_, workflow: { name: string; description: string }) => {
  try {
    return db.createWorkflow(workflow.name, workflow.description)
  } catch (error) {
    console.error('Error creating workflow:', error)
    throw error
  }
})

ipcMain.handle('update-workflow', async (_, id: number, data: { name?: string; description?: string; status?: string }) => {
  try {
    return db.updateWorkflow(id, data)
  } catch (error) {
    console.error('Error updating workflow:', error)
    throw error
  }
})

ipcMain.handle('delete-workflow', async (_, id: number) => {
  try {
    db.deleteWorkflow(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting workflow:', error)
    throw error
  }
})

ipcMain.handle('get-workflow', async (_, id: number) => {
  try {
    return db.getWorkflow(id)
  } catch (error) {
    console.error('Error getting workflow:', error)
    throw error
  }
})

