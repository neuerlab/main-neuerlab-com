#!/usr/bin/env python3
"""
Inject agent-view includes into all HTML files:
  1. <link rel="alternate" type="text/markdown" href="/neuer-lab.md" title="Neuer Lab, in Markdown"> in <head>
  2. <link rel="stylesheet" href="[path]assets/css/agent-view.css?v=1"> in <head>
  3. <script src="[path]assets/js/agent-view.js?v=1" defer></script> before </body>

Also bump footer.js cache-buster from v=12 to v=13 since we modified it.
"""

import re
import sys
import os
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent

ALL_NAV_FILES = [
    "index.html",
    "about.html",
    "affirmations.html",
    "alignment.html",
    "clarity.html",
    "emotional-release.html",
    "journal.html",
    "longevity-guide.html",
    "longevity-guide-de.html",
    "mediumship.html",
    "mental-training.html",
    "privacy.html",
    "terms.html",
    "selbstreflexion.html",
    "selbstreflexion-bestaetigen.html",
    "selbstreflexion-danke.html",
    "journal/why-you-feel-lost.html",
    "journal/what-mediumship-really-is.html",
    "journal/future-of-healthcare.html",
    "journal/alignment-not-discipline.html",
    "journal/hidden-cost-of-thinking.html",
]

ALTERNATE_LINK = '<link rel="alternate" type="text/markdown" href="/neuer-lab.md" title="Neuer Lab, in Markdown">'


def inject_file(filepath):
    """Inject the three includes into a single HTML file."""
    html = filepath.read_text(encoding='utf-8')
    original = html
    is_subdir = '/journal/' in str(filepath) or filepath.parent.name == 'journal'
    prefix = '../' if is_subdir else ''
    
    changed = False
    
    # 1. Add <link rel="alternate"> after the last <link rel="stylesheet" ...> in <head>
    # Find the last stylesheet link in head
    head_end = html.find('</head>')
    if head_end == -1:
        print(f"  ERROR: No </head> in {filepath.name}")
        return False
    
    head_content = html[:head_end]
    
    # Check if already present
    if 'type="text/markdown"' not in head_content:
        # Find the last <link rel="stylesheet" in head
        last_link_pos = head_content.rfind('<link rel="stylesheet"')
        if last_link_pos == -1:
            # Insert right before </head>
            insert_pos = head_end
        else:
            # Find end of that line
            line_end = head_content.find('\n', last_link_pos)
            if line_end == -1:
                insert_pos = head_end
            else:
                insert_pos = line_end + 1
        
        html = html[:insert_pos] + '  ' + ALTERNATE_LINK + '\n' + html[insert_pos:]
        changed = True
    
    # 2. Add agent-view.css after nav.css link (or after the last stylesheet link)
    head_end = html.find('</head>')
    head_content = html[:head_end]
    
    if 'agent-view.css' not in head_content:
        agent_css = f'<link rel="stylesheet" href="{prefix}assets/css/agent-view.css?v=1">'
        # Find nav.css link
        nav_css_pos = head_content.rfind('assets/css/nav.css')
        if nav_css_pos != -1:
            line_end = head_content.find('\n', nav_css_pos)
            insert_pos = line_end + 1 if line_end != -1 else head_end
        else:
            # Find last stylesheet
            last_link_pos = head_content.rfind('<link rel="stylesheet"')
            if last_link_pos != -1:
                line_end = head_content.find('\n', last_link_pos)
                insert_pos = line_end + 1 if line_end != -1 else head_end
            else:
                insert_pos = head_end
        
        html = html[:insert_pos] + '  ' + agent_css + '\n' + html[insert_pos:]
        changed = True
    
    # 3. Add agent-view.js script before </body> (after footer.js)
    if 'agent-view.js' not in html:
        agent_js = f'<script src="{prefix}assets/js/agent-view.js?v=1" defer></script>'
        # Find footer.js script tag
        footer_js_pos = html.rfind('assets/js/footer.js')
        if footer_js_pos != -1:
            # Find the end of that script tag
            script_end = html.find('>', footer_js_pos)
            line_end = html.find('\n', script_end)
            insert_pos = line_end + 1 if line_end != -1 else script_end + 1
        else:
            # Insert before </body>
            body_end = html.find('</body>')
            insert_pos = body_end if body_end != -1 else len(html)
        
        html = html[:insert_pos] + '  ' + agent_js + '\n' + html[insert_pos:]
        changed = True
    
    # 4. Bump footer.js cache-buster from v=12 to v=13
    html = re.sub(r'(assets/js/footer\.js\?v=)12', r'\g<1>13', html)
    
    if html != original:
        filepath.write_text(html, encoding='utf-8')
        print(f"  ✓ Injected includes into {filepath}")
    else:
        print(f"  - No changes needed for {filepath}")
    
    return True


def main():
    os.chdir(REPO_ROOT)
    
    print("=" * 70)
    print("INJECTING AGENT-VIEW INCLUDES")
    print("=" * 70)
    
    success = True
    for fname in ALL_NAV_FILES:
        fpath = REPO_ROOT / fname
        if not fpath.exists():
            print(f"  ERROR: {fname} not found")
            success = False
            continue
        if not inject_file(fpath):
            success = False
    
    print("\n" + "=" * 70)
    if success:
        print("✅ ALL INCLUDES INJECTED")
    else:
        print("❌ SOME ERRORS")
    print("=" * 70)
    
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
