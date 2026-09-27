#!/usr/bin/env python3
"""
Reorder navigation items in all HTML files.

NEW ORDER: Mission · Pathways · Tools · Guide · Journal · About · Connect

This version properly handles whitespace between nav items by extracting the
items together with their leading whitespace.
"""

import re
import sys
import os
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent

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
    """Find the position just past the matching close tag, accounting for nesting."""
    depth = 1
    pos = start_pos
    while depth > 0 and pos < len(text):
        open_m = re.search(open_tag_re, text[pos:])
        close_m = re.search(re.escape(close_tag_str), text[pos:])
        if not close_m:
            return len(text)
        if open_m and open_m.start() < close_m.start():
            depth += 1
            pos += open_m.end()
        else:
            depth -= 1
            pos += close_m.end()
    return pos


def extract_desktop_items_with_whitespace(block):
    """
    Extract items from the <ul class="nav-links"> inner content.
    Returns list of (label, full_markup_including_leading_whitespace, leading_whitespace).
    """
    items = []
    pos = 0
    while pos < len(block):
        li_match = re.search(r'<li[^>]*>', block[pos:])
        if not li_match:
            break
        # Capture leading whitespace
        ws = block[pos:pos + li_match.start()]
        li_start = pos + li_match.start()
        li_open_end = pos + li_match.end()
        li_close_pos = find_matching_close(block, r'<li[^>]*>', '</li>', li_open_end)
        li_full = block[li_start:li_close_pos]
        
        if 'nav-tools-item' in li_match.group(0):
            btn_m = re.search(r'<button[^>]*class="nav-tools-trigger"[^>]*>(.*?)</button>', li_full, re.DOTALL)
            if btn_m:
                btn_text = re.sub(r'<[^>]+>', '', btn_m.group(1)).strip()
                label = btn_text.replace('✦', '').strip()
            else:
                label = "(dropdown)"
        else:
            a_m = re.search(r'<a[^>]*>(.*?)</a>', li_full, re.DOTALL)
            if a_m:
                label = re.sub(r'<[^>]+>', '', a_m.group(1)).strip()
            else:
                label = "(unknown)"
        
        items.append((label, ws, li_full))
        pos = li_close_pos
    
    return items


def extract_drawer_items_with_whitespace(block):
    """
    Extract items from the drawer inner content.
    Returns list of (label, leading_whitespace, full_markup).
    """
    items = []
    pos = 0
    while pos < len(block):
        group_m = re.search(r'<div class="nav-drawer-group">', block[pos:])
        a_m = re.search(r'<a[^>]*>', block[pos:])
        
        # Find which comes first
        next_item_pos = None
        next_item_is_group = False
        
        if group_m and (not a_m or group_m.start() < a_m.start()):
            next_item_pos = pos + group_m.start()
            next_item_is_group = True
        elif a_m:
            next_item_pos = pos + a_m.start()
            next_item_is_group = False
        else:
            break
        
        ws = block[pos:next_item_pos]
        
        if next_item_is_group:
            group_open_end = next_item_pos + group_m.end() - group_m.start()  
            # Recalculate properly
            group_start = next_item_pos
            group_open_end = next_item_pos + group_m.end()
            group_close_pos = find_matching_close(block, r'<div[^>]*>', '</div>', group_open_end)
            group_full = block[group_start:group_close_pos]
            
            label_m = re.search(r'<span class="nav-drawer-group-label">(.*?)</span>', group_full, re.DOTALL)
            label = label_m.group(1).strip() if label_m else "(group)"
            items.append((label, ws, group_full))
            pos = group_close_pos
        else:
            a_start = next_item_pos
            close_a = re.search(r'</a>', block[a_start:])
            if close_a:
                a_full = block[a_start:a_start + close_a.end()]
                a_text = re.sub(r'<[^>]+>', '', a_full).strip()
                label = a_text.lstrip('✦').strip()
                items.append((label, ws, a_full))
                pos = a_start + close_a.end()
            else:
                break
    
    return items


def reorder_file(filepath, desktop_order, drawer_order):
    """Reorder both desktop nav and drawer nav in a file."""
    html = filepath.read_text(encoding='utf-8')
    original = html
    
    # --- Desktop nav ---
    ul_m = re.search(r'(<ul class="nav-links">)(.*?)(</ul>)', html, re.DOTALL)
    if not ul_m:
        print(f"  ERROR: Could not find desktop nav in {filepath.name}")
        return False
    
    ul_open = ul_m.group(1)
    ul_inner = ul_m.group(2)
    ul_close = ul_m.group(3)
    ul_full_start = ul_m.start(1)
    ul_full_end = ul_m.end(3)
    
    desktop_items = extract_desktop_items_with_whitespace(ul_inner)
    if not desktop_items:
        print(f"  ERROR: No desktop items found in {filepath.name}")
        return False
    
    # Build label -> (ws, markup) map
    desktop_map = {label: (ws, markup) for label, ws, markup in desktop_items}
    
    # Verify all expected items present
    desktop_labels = [label for label, _, _ in desktop_items]
    for expected in desktop_order:
        if expected not in desktop_map:
            print(f"  ERROR: Desktop nav missing '{expected}' in {filepath.name}. Found: {desktop_labels}")
            return False
    
    # Rebuild
    new_inner_parts = []
    for label in desktop_order:
        ws, markup = desktop_map[label]
        new_inner_parts.append(ws + markup)
    new_ul_block = ul_open + ''.join(new_inner_parts) + ul_close
    
    html = html[:ul_full_start] + new_ul_block + html[ul_full_end:]
    
    # --- Drawer nav ---
    drawer_m = re.search(r'(<div class="nav-drawer"[^>]*id="navDrawer"[^>]*>)', html)
    if not drawer_m:
        drawer_m = re.search(r'(<div class="nav-drawer"[^>]*>)', html)
    if not drawer_m:
        print(f"  ERROR: Could not find drawer in {filepath.name}")
        return False
    
    drawer_open = drawer_m.group(1)
    drawer_open_end = drawer_m.end()
    drawer_close_pos = find_matching_close(html, r'<div[^>]*>', '</div>', drawer_open_end)
    drawer_inner = html[drawer_open_end:drawer_close_pos]
    drawer_full_start = drawer_m.start()
    
    drawer_items = extract_drawer_items_with_whitespace(drawer_inner)
    if not drawer_items:
        print(f"  ERROR: No drawer items found in {filepath.name}")
        return False
    
    drawer_map = {label: (ws, markup) for label, ws, markup in drawer_items}
    
    drawer_labels = [label for label, _, _ in drawer_items]
    for expected in drawer_order:
        if expected not in drawer_map:
            print(f"  ERROR: Drawer nav missing '{expected}' in {filepath.name}. Found: {drawer_labels}")
            return False
    
    # Rebuild drawer
    new_inner_parts = []
    for label in drawer_order:
        ws, markup = drawer_map[label]
        new_inner_parts.append(ws + markup)
    new_drawer_block = drawer_open + ''.join(new_inner_parts) + '</div>'
    
    html = html[:drawer_full_start] + new_drawer_block + html[drawer_close_pos:]
    
    if html == original:
        print(f"  WARNING: No changes made to {filepath.name}")
    else:
        filepath.write_text(html, encoding='utf-8')
        print(f"  ✓ Reordered {filepath.name}")
    
    return True


def main():
    os.chdir(REPO_ROOT)
    
    # New order for full-nav files (with Guide dropdown)
    FULL_DESKTOP_ORDER = ['Mission', 'Pathways', 'Tools', 'Guide', 'Journal', 'About', 'Connect']
    FULL_DRAWER_ORDER = ['Mission', 'Pathways', 'Tools', 'Guide', 'Journal', 'About', 'Connect']
    
    # New order for simple-nav files (no Guide dropdown)
    SIMPLE_DESKTOP_ORDER = ['Mission', 'Pathways', 'Tools', 'Journal', 'About', 'Connect']
    SIMPLE_DRAWER_ORDER = ['Mission', 'Pathways', 'Tools', 'Journal', 'About', 'Connect']
    
    print("=" * 70)
    print("REORDERING NAVIGATION")
    print("=" * 70)
    print(f"\nNew full-nav order:    {' · '.join(FULL_DESKTOP_ORDER)}")
    print(f"New simple-nav order:  {' · '.join(SIMPLE_DESKTOP_ORDER)}")
    print()
    
    # First, revert any changes from the previous (broken) run
    print("Reverting to clean state first...")
    os.system("git checkout -- *.html journal/*.html")
    print("Done.\n")
    
    success = True
    
    print("--- Full-nav files (16) ---")
    for fname in FULL_NAV_FILES:
        fpath = REPO_ROOT / fname
        print(f"\n{fname}:")
        if not reorder_file(fpath, FULL_DESKTOP_ORDER, FULL_DRAWER_ORDER):
            success = False
    
    print("\n--- Simple-nav files (5) ---")
    for fname in SIMPLE_NAV_FILES:
        fpath = REPO_ROOT / fname
        print(f"\n{fname}:")
        if not reorder_file(fpath, SIMPLE_DESKTOP_ORDER, SIMPLE_DRAWER_ORDER):
            success = False
    
    print("\n" + "=" * 70)
    if success:
        print("✅ ALL FILES REORDERED SUCCESSFULLY")
    else:
        print("❌ SOME ERRORS OCCURRED")
    print("=" * 70)
    
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
