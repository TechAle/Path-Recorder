export async function retryApiLimit(asyncTask) {
    while (true) {
        try {
            await asyncTask();
            break; // Exit the loop if the task succeeds
        } catch (e) {
            if (e.message !== "RateLimitHit") {
                throw e; // Rethrow if the error is not a rate limit error
            }
            // Optionally add a small delay to avoid immediate retry
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}