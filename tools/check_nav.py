#!/usr/bin/env python3
"""
Check that the navigation order is identical in the desktop nav (.nav-links)
and the mobile drawer (.nav-drawer) across all HTML files, and that all files
agree with each other.

For desktop nav, the items are:
  - <li class="nav-tools-item"> ... </li>  (dropdown, labeled by its trigger button text)
  - <li><a href="...">Label</a></li>       (plain link)

For the drawer, the items are:
  - <div class="nav-drawer-group"> with a label and links  (dropdown group)
  - <a href="...">Label</a>                               (plain link)

We extract a normalized list of top-level item labels for both desktop and drawer,
then compare:
  1. Within each file: desktop order == drawer order
  2. Across all files: desktop order is identical, drawer order is identical
"""

import re
import sys
import os
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent

# Files that have the FULL nav (with Guide dropdown). These are the 16 files
# Nicola refers to. Journal articles have a simplified nav.
FULL_NAV_FILES = [
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
]

SIMPLE_NAV_FILES = [
    "journal/why-you-feel-lost.html",
    "journal/what-mediumship-really-is.html",
    "journal/future-of-healthcare.html",
    "journal/alignment-not-discipline.html",
    "journal/hidden-cost-of-thinking.html",
]

ALL_NAV_FILES = FULL_NAV_FILES + SIMPLE_NAV_FILES


def find_matching_close(text, open_tag_re, close_tag_str, start_pos):
    """
    Given text starting after an opening tag, find the position of the matching
    close tag, accounting for nesting.
    Returns the index just past the closing tag.
    """
    depth = 1
    pos = start_pos
    while depth > 0 and pos < len(text):
        open_m = re.search(open_tag_re, text[pos:])
        close_m = re.search(re.escape(close_tag_str), text[pos:])
        if not close_m:
            return len(text)  # malformed, bail out
        if open_m and open_m.start() < close_m.start():
            depth += 1
            pos += open_m.end()
        else:
            depth -= 1
            pos += close_m.end()
    return pos


def extract_desktop_nav_order(html_text):
    """
    Extract the order of top-level navigation items from the desktop <ul class="nav-links">.
    Returns a list of labels. Dropdowns are represented by their trigger button text.
    """
    m = re.search(r'<ul class="nav-links">(.*?)</ul>', html_text, re.DOTALL)
    if not m:
        return None
    block = m.group(1)

    items = []
    pos = 0
    while pos < len(block):
        li_match = re.search(r'<li[^>]*>', block[pos:])
        if not li_match:
            break
        li_open_end = pos + li_match.end()
        
        # Find matching </li>
        li_close_pos = find_matching_close(block, r'<li[^>]*>', '</li>', li_open_end)
        li_content = block[pos + li_match.start():li_close_pos]

        if 'nav-tools-item' in li_match.group(0):
            btn_m = re.search(r'<button[^>]*class="nav-tools-trigger"[^>]*>(.*?)</button>', li_content, re.DOTALL)
            if btn_m:
                btn_text = re.sub(r'<[^>]+>', '', btn_m.group(1)).strip()
                # Normalize: remove leading ✦ so "✦ Tools" matches "Tools"
                btn_text = btn_text.replace('✦', '').strip()
                items.append(btn_text)
            else:
                items.append("(dropdown)")
        else:
            a_m = re.search(r'<a[^>]*>(.*?)</a>', li_content, re.DOTALL)
            if a_m:
                a_text = re.sub(r'<[^>]+>', '', a_m.group(1)).strip()
                items.append(a_text)
            else:
                items.append("(unknown)")
        pos = li_close_pos

    return items


def extract_drawer_nav_order(html_text):
    """
    Extract the order of top-level navigation items from the mobile drawer <div class="nav-drawer">.
    Returns a list of labels. Drawer groups are represented by their group label text.
    """
    # Find the nav-drawer div and extract its full content
    m = re.search(r'<div class="nav-drawer"[^>]*id="navDrawer"[^>]*>', html_text)
    if not m:
        m = re.search(r'<div class="nav-drawer"[^>]*>', html_text)
    if not m:
        return None
    
    drawer_open_end = m.end()
    drawer_close_pos = find_matching_close(html_text, r'<div[^>]*>', '</div>', drawer_open_end)
    block = html_text[drawer_open_end:drawer_close_pos]

    items = []
    pos = 0
    while pos < len(block):
        # Look for next group div or standalone <a>
        group_m = re.search(r'<div class="nav-drawer-group">', block[pos:])
        a_m = re.search(r'<a[^>]*>', block[pos:])

        if group_m and (not a_m or group_m.start() < a_m.start()):
            group_open_end = pos + group_m.end()
            group_close_pos = find_matching_close(block, r'<div[^>]*>', '</div>', group_open_end)
            group_content = block[pos + group_m.start():group_close_pos]
            label_m = re.search(r'<span class="nav-drawer-group-label">(.*?)</span>', group_content, re.DOTALL)
            if label_m:
                items.append(label_m.group(1).strip())
            else:
                items.append("(group)")
            pos = group_close_pos
        elif a_m:
            a_start = pos + a_m.start()
            close_a = re.search(r'</a>', block[a_start:])
            if close_a:
                a_content = block[a_start:a_start + close_a.end()]
                a_text = re.sub(r'<[^>]+>', '', a_content).strip()
                a_text = a_text.lstrip('✦').strip()
                items.append(a_text)
                pos = a_start + close_a.end()
            else:
                break
        else:
            break

    return items


def main():
    os.chdir(REPO_ROOT)
    
    all_results = {}
    errors = []
    
    print("=" * 70)
    print("NAVIGATION ORDER CHECK")
    print("=" * 70)
    
    for fname in ALL_NAV_FILES:
        fpath = REPO_ROOT / fname
        if not fpath.exists():
            errors.append(f"FILE MISSING: {fname}")
            continue
        html = fpath.read_text(encoding='utf-8')
        
        desktop = extract_desktop_nav_order(html)
        drawer = extract_drawer_nav_order(html)
        
        all_results[fname] = {'desktop': desktop, 'drawer': drawer}
        
        match = "✓ MATCH" if desktop == drawer else "✗ MISMATCH"
        print(f"\n{fname}")
        print(f"  Desktop: {desktop}")
        print(f"  Drawer:  {drawer}")
        print(f"  {match}")
    
    # Cross-file consistency check
    print("\n" + "=" * 70)
    print("CROSS-FILE CONSISTENCY")
    print("=" * 70)
    
    # Group: full-nav files should all have the same desktop order
    full_desktops = {}
    full_drawers = {}
    for fname in FULL_NAV_FILES:
        if fname in all_results:
            d = tuple(all_results[fname]['desktop'] or [])
            r = tuple(all_results[fname]['drawer'] or [])
            full_desktops.setdefault(d, []).append(fname)
            full_drawers.setdefault(r, []).append(fname)
    
    print("\nFull-nav desktop orders found:")
    for order, files in full_desktops.items():
        if len(files) < len(FULL_NAV_FILES):
            print(f"  {list(order)} -> {len(files)} files: {files}")
        else:
            print(f"  {list(order)} -> ALL {len(files)} files ✓")
    
    print("\nFull-nav drawer orders found:")
    for order, files in full_drawers.items():
        if len(files) < len(FULL_NAV_FILES):
            print(f"  {list(order)} -> {len(files)} files: {files}")
        else:
            print(f"  {list(order)} -> ALL {len(files)} files ✓")
    
    # Simple-nav files
    simple_desktops = {}
    simple_drawers = {}
    for fname in SIMPLE_NAV_FILES:
        if fname in all_results:
            d = tuple(all_results[fname]['desktop'] or [])
            r = tuple(all_results[fname]['drawer'] or [])
            simple_desktops.setdefault(d, []).append(fname)
            simple_drawers.setdefault(r, []).append(fname)
    
    print("\nSimple-nav desktop orders found:")
    for order, files in simple_desktops.items():
        if len(files) < len(SIMPLE_NAV_FILES):
            print(f"  {list(order)} -> {len(files)} files: {files}")
        else:
            print(f"  {list(order)} -> ALL {len(files)} files ✓")
    
    print("\nSimple-nav drawer orders found:")
    for order, files in simple_drawers.items():
        if len(files) < len(SIMPLE_NAV_FILES):
            print(f"  {list(order)} -> {len(files)} files: {files}")
        else:
            print(f"  {list(order)} -> ALL {len(files)} files ✓")
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    all_ok = True
    for fname, result in all_results.items():
        if result['desktop'] != result['drawer']:
            print(f"  ✗ {fname}: desktop != drawer")
            all_ok = False
    
    if len(full_desktops) > 1:
        print(f"  ✗ Full-nav desktop order is NOT consistent across all {len(FULL_NAV_FILES)} files")
        all_ok = False
    if len(full_drawers) > 1:
        print(f"  ✗ Full-nav drawer order is NOT consistent across all {len(FULL_NAV_FILES)} files")
        all_ok = False
    if len(simple_desktops) > 1:
        print(f"  ✗ Simple-nav desktop order is NOT consistent across all {len(SIMPLE_NAV_FILES)} files")
        all_ok = False
    if len(simple_drawers) > 1:
        print(f"  ✗ Simple-nav drawer order is NOT consistent across all {len(SIMPLE_NAV_FILES)} files")
        all_ok = False
    
    if all_ok and len(full_desktops) == 1 and len(full_drawers) == 1:
        print("  ✓ All files: desktop == drawer")
        print(f"  ✓ All {len(FULL_NAV_FILES)} full-nav files have identical desktop order")
        print(f"  ✓ All {len(FULL_NAV_FILES)} full-nav files have identical drawer order")
        if len(simple_desktops) == 1 and len(simple_drawers) == 1:
            print(f"  ✓ All {len(SIMPLE_NAV_FILES)} simple-nav files have identical desktop order")
            print(f"  ✓ All {len(SIMPLE_NAV_FILES)} simple-nav files have identical drawer order")
        print("\n  ✅ ALL CHECKS PASSED")
    else:
        print("\n  ❌ SOME CHECKS FAILED")
    
    if errors:
        print("\nERRORS:")
        for e in errors:
            print(f"  {e}")
    
    return 0 if all_ok else 1


if __name__ == '__main__':
    sys.exit(main())
