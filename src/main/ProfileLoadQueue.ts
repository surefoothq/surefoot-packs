type QueueTask<T> = () => Promise<T>

class ProfileLoadQueue {
  private queue: QueueTask<unknown>[] = []
  private running = false

  enqueue<T>(task: QueueTask<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task()
          resolve(result)
        } catch (err) {
          reject(err)
        }
      })

      this.runNext()
    })
  }

  private async runNext(): Promise<void> {
    if (this.running) return
    const task = this.queue.shift()
    if (!task) return

    this.running = true
    try {
      await task()
    } finally {
      this.running = false
      this.runNext()
    }
  }
}

export const profileLoadQueue = new ProfileLoadQueue()
