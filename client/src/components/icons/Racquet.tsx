import { LucideProps } from "lucide-react";

export default function Racquet(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 4c-4.42 0-8 3.58-8 8 0 3.31 2.01 6.15 4.88 7.36C7.21 19.77 8.59 20 10 20c4.42 0 8-3.58 8-8 0-3.31-2.01-6.15-4.88-7.36C11.79 4.23 10.41 4 9 4z" stroke={props.color || "currentColor"} strokeWidth={props.strokeWidth || 2} fill="none" />
      <path d="M9 4v16M4 15h10M4 8h10" stroke={props.color || "currentColor"} strokeWidth={props.strokeWidth || 2} />
      <path d="M13.9 17.5l6.1 2.5v-7l-6-3" stroke={props.color || "currentColor"} strokeWidth={props.strokeWidth || 2} />
    </svg>
  );
}