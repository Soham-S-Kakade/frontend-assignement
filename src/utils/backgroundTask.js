export class BackgroundTaskManager {
    constructor() {
        this.tasks = [];
        this.isProcessing = false;
    }

    scheduleTask(task, priority = 'normal') {
        const taskWithPriority = {
            id: Date.now() + Math.random(),
            task,
            priority,
            timestamp: Date.now()
        };

        this.tasks.push(taskWithPriority);
        this.processTasks();
    }

    processTasks() {
        if (this.isProcessing || this.tasks.length === 0) return;

        this.isProcessing = true;
        this.processNextTask();
    }

    processNextTask() {
        if (this.tasks.length === 0) {
            this.isProcessing = false;
            return;
        }

        const task = this.tasks.shift();
        
        if ('requestIdleCallback' in window) {
            requestIdleCallback((deadline) => {
                this.executeTask(task, deadline);
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                this.executeTask(task, { timeRemaining: () => 50 });
            }, 0);
        }
    }

    executeTask(task, deadline) {
        try {
            const startTime = performance.now();
            
            task.task();
            
            const executionTime = performance.now() - startTime;
            console.log(`Task ${task.id} executed in ${executionTime}ms`);
            
        } catch (error) {
            console.error(`Task ${task.id} failed:`, error);
        }

        // Continue processing if we have time remaining
        if (deadline.timeRemaining() > 0) {
            this.processNextTask();
        } else {
            this.isProcessing = false;
            // Schedule next batch
            setTimeout(() => this.processTasks(), 0);
        }
    }

    clearTasks() {
        this.tasks = [];
        this.isProcessing = false;
    }
}

export const backgroundTaskManager = new BackgroundTaskManager();