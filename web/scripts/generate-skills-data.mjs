import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.join(__dirname, '../../skills');
const outputFile = path.join(__dirname, '../src/data/skills.json');

const categoryGroups = {
  design: ['animation', 'tailwind', 'design', 'accessibility', 'design-systems', 'illustration', 'figma'],
  development: ['dev-process', 'workflows'],
  platform: ['wordpress', 'flutter', 'swiftui'],
  marketing: ['marketing', 'copywriting']
};

function getGroup(category) {
  for (const [group, categories] of Object.entries(categoryGroups)) {
    if (categories.includes(category)) return group;
  }
  return 'other';
}

function parseSkillMd(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return { name: '', description: '' };
  
  const frontmatter = frontmatterMatch[1];
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*["']?(.+?)["']?$/m);
  
  return {
    name: nameMatch ? nameMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim() : ''
  };
}

const skills = [];
const categories = fs.readdirSync(skillsDir).filter(f => 
  fs.statSync(path.join(skillsDir, f)).isDirectory()
);

for (const category of categories) {
  const categoryPath = path.join(skillsDir, category);
  const skillDirs = fs.readdirSync(categoryPath).filter(f =>
    fs.statSync(path.join(categoryPath, f)).isDirectory()
  );
  
  for (const skillDir of skillDirs) {
    const skillMdPath = path.join(categoryPath, skillDir, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;
    
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const { name, description } = parseSkillMd(content);
    
    skills.push({
      id: skillDir,
      name: name || skillDir,
      category,
      group: getGroup(category),
      description: description || 'No description available',
      path: `skills/${category}/${skillDir}`
    });
  }
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify({ skills, categories: Object.keys(categoryGroups).flatMap(g => categoryGroups[g]) }, null, 2));
console.log(`Generated ${skills.length} skills`);
