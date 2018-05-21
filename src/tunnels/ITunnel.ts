export default interface ITunnel {

	getEntity(): any; // wrapped instance of whatever
	registerAction(name: string, callback: Function); // wrapped entity can provide callback for any command name
}
