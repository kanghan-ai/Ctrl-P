import { OnboardingStep } from '@/lib/onboarding-content';

interface GuideStepProps {
    step: OnboardingStep;
}

export default function GuideStep({ step }: GuideStepProps) {
    return (
        <div className="text-center px-8">
            {/* Icon */}
            <div className="text-6xl mb-6 animate-bounce-slow">
                {step.icon}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                {step.title}
            </h2>

            {/* Content */}
            <div className="space-y-3 text-neutral-600 max-w-md mx-auto">
                {step.content.map((line, index) => (
                    <p
                        key={index}
                        className={`text-base leading-relaxed ${line.startsWith('💡') || line.startsWith('💾')
                                ? 'text-sm text-neutral-500 italic'
                                : ''
                            }`}
                    >
                        {line}
                    </p>
                ))}
            </div>

            {/* Highlight keyword */}
            {step.highlight && (
                <div className="mt-6 inline-block px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
                    {step.highlight}
                </div>
            )}
        </div>
    );
}
