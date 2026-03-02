interface StepIndicatorProps {
    totalSteps: number;
    currentStep: number;
}

export default function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
                <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentStep
                            ? 'bg-black w-8'
                            : i < currentStep
                                ? 'bg-neutral-400'
                                : 'bg-neutral-200'
                        }`}
                />
            ))}
        </div>
    );
}
