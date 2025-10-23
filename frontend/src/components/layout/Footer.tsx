import Link from "next/link";
import { Github, Twitter, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>by Siddhartha Pittala and the community</span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/siddhartha296/CurioHub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://twitter.com/curiohub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <Twitter className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="text-center mt-4 text-sm text-gray-500">
          <p>© 2025 CurioHub. Open source and community-driven.</p>
        </div>
      </div>
    </footer>
  );
}
