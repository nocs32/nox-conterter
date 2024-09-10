import Link from "next/link";

export function Logo() {
    return (
        <div className="flex items-center gap-x-2">
            <Link href="/">
                <h1 className="dark:text-white font-bold text-xl lg:text-2xl">
                    <span className="text-red-500">NOX</span>CONVERTER
                </h1>
            </Link>
        </div>
    )
}