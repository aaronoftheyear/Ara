#!/usr/bin/env python3
"""
Local Anime List Analyzer
Analyzes your MyAnimeList data and generates recommendations
"""

import pandas as pd
import json
from collections import Counter
import sys
import os

def analyze_anime_list(csv_file):
    """Analyze anime list and generate insights"""
    
    try:
        # Load the data
        df = pd.read_csv(csv_file)
        print(f"✅ Loaded {len(df)} anime entries")
        
        # Basic stats
        print(f"\n📊 BASIC STATISTICS:")
        print(f"- Total anime: {len(df)}")
        print(f"- Completed: {len(df[df['My Status'] == 'Completed'])}")
        print(f"- Watching: {len(df[df['My Status'] == 'Watching'])}")
        print(f"- Plan to Watch: {len(df[df['My Status'] == 'Plan to Watch'])}")
        print(f"- Dropped: {len(df[df['My Status'] == 'Dropped'])}")
        print(f"- On Hold: {len(df[df['My Status'] == 'On Hold'])}")
        
        # High-rated anime analysis
        high_rated = df[df['My Score'] >= 8]
        completed = df[df['My Status'] == 'Completed']
        dropped = df[df['My Status'] == 'Dropped']
        
        print(f"\n⭐ HIGH-RATED ANALYSIS (8+ scores):")
        print(f"- High-rated anime: {len(high_rated)}")
        if len(high_rated) > 0:
            avg_score = high_rated['My Score'].mean()
            print(f"- Average high-rated score: {avg_score:.2f}")
        
        # Genre analysis
        print(f"\n🎭 GENRE PREFERENCES:")
        genre_preferences = {}
        for genres in high_rated['Genres'].dropna():
            if isinstance(genres, str):
                for genre in genres.split(', '):
                    genre = genre.strip()
                    if genre:
                        genre_preferences[genre] = genre_preferences.get(genre, 0) + 1
        
        top_genres = sorted(genre_preferences.items(), key=lambda x: x[1], reverse=True)[:10]
        for i, (genre, count) in enumerate(top_genres, 1):
            print(f"{i:2d}. {genre}: {count} high-rated anime")
        
        # Top completed anime
        print(f"\n🏆 YOUR TOP COMPLETED ANIME:")
        top_completed = completed.nlargest(15, 'My Score')
        for i, (_, anime) in enumerate(top_completed.iterrows(), 1):
            title = anime['Title'][:50] + "..." if len(anime['Title']) > 50 else anime['Title']
            print(f"{i:2d}. {title} ({anime['My Score']}/10)")
        
        # Dropped anime analysis
        if len(dropped) > 0:
            print(f"\n❌ DROPPED ANIME PATTERNS:")
            dropped_genres = {}
            for genres in dropped['Genres'].dropna():
                if isinstance(genres, str):
                    for genre in genres.split(', '):
                        genre = genre.strip()
                        if genre:
                            dropped_genres[genre] = dropped_genres.get(genre, 0) + 1
            
            top_dropped_genres = sorted(dropped_genres.items(), key=lambda x: x[1], reverse=True)[:5]
            for genre, count in top_dropped_genres:
                print(f"- {genre}: {count} dropped anime")
        
        # Generate recommendations based on patterns
        print(f"\n🎯 RECOMMENDATION ANALYSIS:")
        print("Based on your high-rated anime, you should look for:")
        
        # Find common themes in high-rated anime
        high_rated_titles = high_rated['Title'].tolist()
        high_rated_genres = []
        for genres in high_rated['Genres'].dropna():
            if isinstance(genres, str):
                high_rated_genres.extend([g.strip() for g in genres.split(', ')])
        
        top_themes = Counter(high_rated_genres).most_common(5)
        for theme, count in top_themes:
            print(f"- {theme} (appears in {count} of your high-rated anime)")
        
        # Save analysis to file
        analysis_data = {
            'total_anime': len(df),
            'completed': len(completed),
            'high_rated': len(high_rated),
            'top_genres': dict(top_genres[:10]),
            'top_completed': top_completed[['Title', 'My Score', 'Genres']].to_dict('records'),
            'recommendation_themes': dict(top_themes)
        }
        
        with open('anime_analysis.json', 'w') as f:
            json.dump(analysis_data, f, indent=2)
        
        print(f"\n💾 Analysis saved to 'anime_analysis.json'")
        
        return analysis_data
        
    except Exception as e:
        print(f"❌ Error analyzing data: {e}")
        return None

def generate_gemini_prompt(analysis_data):
    """Generate a prompt for Gemini based on the analysis"""
    
    if not analysis_data:
        return None
    
    prompt = f"""Based on my anime analysis, here are my preferences:

TOP GENRES (from high-rated anime):
"""
    
    for i, (genre, count) in enumerate(list(analysis_data['top_genres'].items())[:5], 1):
        prompt += f"{i}. {genre}: {count} high-rated anime\n"
    
    prompt += f"""
TOP COMPLETED ANIME (highest rated):
"""
    
    for i, anime in enumerate(analysis_data['top_completed'][:5], 1):
        prompt += f"{i}. {anime['Title']} ({anime['My Score']}/10) - {anime['Genres']}\n"
    
    prompt += f"""
RECOMMENDATION THEMES:
"""
    
    for theme, count in list(analysis_data['recommendation_themes'].items())[:3]:
        prompt += f"- {theme} (appears in {count} high-rated anime)\n"
    
    prompt += """
Based on this analysis of my actual anime preferences, recommend 3 anime I should watch next. 
Explain why each recommendation fits my taste patterns.
"""
    
    return prompt

def main():
    """Main function"""
    
    print("🎌 MyAnimeList Local Analyzer")
    print("=" * 40)
    
    # Look for CSV file
    csv_files = [f for f in os.listdir('.') if f.endswith('.csv')]
    
    if not csv_files:
        print("❌ No CSV file found. Please export your Google Sheet as CSV first.")
        print("   Steps:")
        print("   1. Open your Google Spreadsheet")
        print("   2. File → Download → CSV")
        print("   3. Save the file in this directory")
        return
    
    if len(csv_files) == 1:
        csv_file = csv_files[0]
    else:
        print("📁 Multiple CSV files found:")
        for i, file in enumerate(csv_files, 1):
            print(f"   {i}. {file}")
        
        try:
            choice = int(input("Select file number: ")) - 1
            csv_file = csv_files[choice]
        except (ValueError, IndexError):
            print("❌ Invalid selection")
            return
    
    print(f"📊 Analyzing: {csv_file}")
    
    # Analyze the data
    analysis = analyze_anime_list(csv_file)
    
    if analysis:
        # Generate Gemini prompt
        prompt = generate_gemini_prompt(analysis)
        
        print(f"\n🤖 GEMINI PROMPT GENERATED:")
        print("=" * 50)
        print(prompt)
        print("=" * 50)
        
        # Save prompt to file
        with open('gemini_prompt.txt', 'w') as f:
            f.write(prompt)
        
        print(f"\n💾 Prompt saved to 'gemini_prompt.txt'")
        print(f"\n📋 NEXT STEPS:")
        print(f"1. Copy the prompt above")
        print(f"2. Go to gemini.google.com")
        print(f"3. Paste the prompt in a new chat")
        print(f"4. Get personalized recommendations based on your data!")

if __name__ == "__main__":
    main()

