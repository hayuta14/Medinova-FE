"use client";

interface StatusStepperProps {
  currentStatus: string;
}

interface StatusStep {
  key: string;
  label: string;
  icon: string;
  color: string;
}

const statusSteps: StatusStep[] = [
  {
    key: "ASSIGNED",
    label: "Đã phân công",
    icon: "fa-user-check",
    color: "info",
  },
  {
    key: "EN_ROUTE",
    label: "Đang di chuyển",
    icon: "fa-route",
    color: "primary",
  },
  {
    key: "ARRIVED",
    label: "Đã đến nơi",
    icon: "fa-map-marker-alt",
    color: "success",
  },
  {
    key: "COMPLETED",
    label: "Hoàn thành",
    icon: "fa-check-circle",
    color: "secondary",
  },
];

export default function StatusStepper({ currentStatus }: StatusStepperProps) {
  // Map status to stepper index
  // PENDING, NEEDS_ATTENTION, ASSIGNED -> index 0
  // EN_ROUTE -> index 1
  // ARRIVED -> index 2
  // COMPLETED -> index 3
  const getStatusIndex = (status: string): number => {
    if (status === "PENDING" || status === "NEEDS_ATTENTION" || status === "ASSIGNED") {
      return 0;
    }
    if (status === "EN_ROUTE") {
      return 1;
    }
    if (status === "ARRIVED") {
      return 2;
    }
    if (status === "COMPLETED") {
      return 3;
    }
    return -1;
  };

  const currentIndex = getStatusIndex(currentStatus);

  const isStepCompleted = (stepIndex: number): boolean => {
    return currentIndex > stepIndex;
  };

  const isStepActive = (stepIndex: number): boolean => {
    return currentIndex === stepIndex;
  };

  const isStepPending = (stepIndex: number): boolean => {
    return currentIndex < stepIndex;
  };

  return (
    <div className="status-stepper">
      <style jsx>{`
        .status-stepper {
          padding: 20px 0;
        }

        .stepper-container {
          display: flex;
          justify-content: space-between;
          position: relative;
          padding: 0 20px;
        }

        .stepper-line {
          position: absolute;
          top: 25px;
          left: 10%;
          right: 10%;
          height: 3px;
          background: #dee2e6;
          z-index: 0;
        }

        .stepper-line-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(
            to right,
            #0d6efd 0%,
            #198754 50%,
            #6c757d 100%
          );
          transition: width 0.5s ease;
        }

        .stepper-step {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .step-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .step-icon.completed {
          background: #198754;
          color: white;
          transform: scale(1.1);
        }

        .step-icon.active {
          background: #0d6efd;
          color: white;
          animation: pulse 2s infinite;
        }

        .step-icon.pending {
          background: #dee2e6;
          color: #6c757d;
        }

        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
          }
        }

        .step-label {
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          max-width: 100px;
        }

        .step-label.completed {
          color: #198754;
        }

        .step-label.active {
          color: #0d6efd;
          font-weight: bold;
        }

        .step-label.pending {
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .stepper-container {
            padding: 0 10px;
          }

          .step-icon {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          .step-label {
            font-size: 12px;
            max-width: 80px;
          }
        }
      `}</style>

      <div className="stepper-container">
        {/* Progress line */}
        <div className="stepper-line">
          <div
            className="stepper-line-fill"
            style={{
              width: `${
                currentIndex >= 0
                  ? ((currentIndex + (isStepActive(currentIndex) ? 0.5 : 1)) /
                      statusSteps.length) *
                    100
                  : 0
              }%`,
            }}
          />
        </div>

        {/* Steps */}
        {statusSteps.map((step, index) => {
          const completed = isStepCompleted(index);
          const active = isStepActive(index);
          const pending = isStepPending(index);

          return (
            <div key={step.key} className="stepper-step">
              <div
                className={`step-icon ${
                  completed ? "completed" : active ? "active" : "pending"
                }`}
              >
                <i className={`fa ${step.icon}`}></i>
              </div>
              <div
                className={`step-label ${
                  completed ? "completed" : active ? "active" : "pending"
                }`}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

