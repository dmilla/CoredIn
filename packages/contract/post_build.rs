use std::process::Command;

fn main() {
    use std::process::Command;

    let mut generate_schema = Command::new("cargo");
    generate_schema.arg("run").arg("schema");

    // Change `ls` to execute in the root directory.
    // generate_schema.current_dir("/");

    // Execute `generate_schema` in the current directory of the program.
    generate_schema.status().expect("Schema generation failed to execute!");
}