export const TypingIndicator = () => (
    <div className="flex justify-start">
        <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-lg border bg-card px-4 py-3.5">
            <span className="sr-only">Beacon is typing</span>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    aria-hidden="true"
                    className="beacon-light size-2 rounded-full bg-beacon"
                    style={{ animationDelay: `${i * 200}ms` }}
                />
            ))}
        </div>
    </div>
)