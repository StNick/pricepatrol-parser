# Contributing to @pricepatrol/parser

Thank you for your interest in contributing to @pricepatrol/parser! This document provides guidelines and information for contributors.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/StNick/pricepatrol-parser.git
   cd pricepatrol-parser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   npm run test:coverage
   ```

4. **Build the package**
   ```bash
   npm run build
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following existing patterns
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run lint
   npm run test:run
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: describe your changes"
   ```

### Commit Message Convention

We use [Conventional Commits](https://conventionalcommits.org/) for commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or modifications
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks

### Code Style

- **TypeScript**: All code must be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code is automatically formatted
- **Testing**: Write tests for all new functionality

### Testing Requirements

- **Unit Tests**: Test all public methods and functions
- **Integration Tests**: Test browser extraction functionality
- **Coverage**: Maintain >90% code coverage
- **Cross-Platform**: Tests must pass on Node.js 18, 20, and 22

## Architecture Guidelines

### Module Organization

- **`src/types.ts`**: Type definitions and interfaces
- **`src/processing.ts`**: Universal processing logic (works everywhere)
- **`src/browser.ts`**: Browser-specific DOM extraction
- **`src/index.ts`**: Main entry point with all exports

### Design Principles

1. **Universal Compatibility**: Core processing must work in any JavaScript environment
2. **Browser Separation**: DOM-specific code isolated to browser module
3. **Type Safety**: Full TypeScript coverage with strict typing
4. **Performance**: Efficient algorithms with minimal dependencies
5. **Reliability**: Comprehensive error handling and validation

### Adding New Features

1. **Core Processing Features** go in `src/processing.ts`
   - Must work in both browser and Node.js
   - Include comprehensive error handling
   - Add corresponding TypeScript types

2. **Browser-Specific Features** go in `src/browser.ts`
   - Can use DOM APIs and browser globals
   - Must work with JSDOM for testing
   - Include fallbacks for missing APIs

3. **Type Definitions** go in `src/types.ts`
   - Export all public interfaces
   - Use JSDoc comments for documentation
   - Follow existing naming conventions

## Testing Guidelines

### Test Structure

```typescript
describe("FeatureName", () => {
  describe("methodName", () => {
    it("should handle normal case", () => {
      // Test implementation
    });
    
    it("should handle edge cases", () => {
      // Test edge cases
    });
    
    it("should handle errors gracefully", () => {
      // Test error conditions
    });
  });
});
```

### Browser Testing

- Use JSDOM for DOM-based tests
- Create realistic HTML fixtures
- Test with various browser environments

## Release Process

Releases are automated via GitHub Actions:

1. **Version Bump**: Update version in `package.json`
2. **Changelog**: Update `CHANGELOG.md` with changes
3. **Tag Release**: Create git tag with format `v1.2.3`
4. **Automated Publishing**: GitHub Actions handles NPM publishing

## Getting Help

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check README.md and code comments

## Code of Conduct

Please be respectful and constructive in all interactions. We're building this together!

Thank you for contributing to @pricepatrol/parser! 🚀